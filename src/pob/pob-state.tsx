import {useState, useEffect} from 'react'
import _ from 'lodash/fp'
import * as Comlink from 'comlink'
import BigNumber from 'bignumber.js'
import {createContainer} from 'unstated-next'
import {
  getStatuses,
  createBurn,
  BurnApiStatus,
  noBurnObservedFilter,
  proveTransaction,
  getInfo,
  prettyErrorMessage,
  BurnStatusType,
} from './api/prover'
import {Chain, ChainId, CHAINS} from './chains'
import {ProverConfig} from '../config/type'
import {Store, createInMemoryStore} from '../common/store'
import {usePersistedState} from '../common/hook-utils'
import {Web3API, makeWeb3Worker} from '../web3'
import {deserializeBigNumber, bigSum, bech32toHex} from '../common/util'
import {config} from '../config/renderer'

export interface BurnWatcher {
  burnAddress: string
  prover: ProverConfig
}

export interface BurnAddressInfo {
  midnightAddress: string
  chainId: ChainId
  reward: number
  autoConversion: boolean
}

export interface RealBurnStatus extends BurnApiStatus {
  burnAddressInfo: BurnAddressInfo
  prover: ProverConfig
  commitment_txid_height: number | null
  redeem_txid_height: number | null
}

export type BurnStatus = {
  lastStatuses: RealBurnStatus[]
  errorMessage?: string
}

export interface Prover extends ProverConfig {
  rewards: Partial<Record<ChainId, number>>
}

export type BurnBalance = {
  chain: Chain
  pending: BigNumber
  available: BigNumber
}

export interface ProofOfBurnData {
  addBurnWatcher: (burnAddress: string, prover: ProverConfig) => boolean
  observeBurnAddress: (
    burnAddress: string,
    prover: ProverConfig,
    midnightAddress: string,
    chain: Chain,
    reward: number,
    autoConversion: boolean,
  ) => Promise<void>
  burnStatuses: Record<string, BurnStatus>
  refresh: () => Promise<void>
  burnBalances: BurnBalance[]
  reset: () => void
  burnAddresses: Record<string, BurnAddressInfo>
  addTx: (prover: ProverConfig, burnTx: string, burnAddress: string) => Promise<void>
  provers: Prover[]
}

export type StorePobData = {
  pob: {
    burnWatchers: BurnWatcher[]
    burnAddresses: Record<string, BurnAddressInfo>
  }
}

export const defaultPobData: StorePobData = {
  pob: {
    burnWatchers: [],
    burnAddresses: {},
  },
}

const FINISHED_BURN_STATUSES: BurnStatusType[] = [
  'redeem_appeared',
  'redeem_another_prover',
  'proof_fail',
  'commitment_fail',
  'redeem_fail',
]

function useProofOfBurnState(
  {
    store,
    web3,
  }: {
    store: Store<StorePobData>
    web3: Comlink.Remote<Web3API>
  } = {
    store: createInMemoryStore(defaultPobData),
    web3: makeWeb3Worker(),
  },
): ProofOfBurnData {
  const [burnWatchers, setBurnWatchers] = usePersistedState(store, ['pob', 'burnWatchers'])
  const [burnAddresses, setBurnAddresses] = usePersistedState(store, ['pob', 'burnAddresses'])
  const [burnStatuses, setBurnStatuses] = useState<Record<string, BurnStatus>>({})
  const [burnBalances, setBurnBalances] = useState<BurnBalance[]>([])
  const [provers, setProvers] = useState(config.provers.map((p): Prover => ({...p, rewards: {}})))

  useEffect(() => {
    Promise.all(
      provers.map((prover) =>
        getInfo(prover)
          .then((chainInfos) => ({
            ...prover,
            rewards: _.mapValues(_.get('min_fee'))(chainInfos),
          }))
          .catch((err) => {
            console.error(err)
            return prover
          }),
      ),
    ).then(setProvers)
  }, [])

  const addBurnWatcher = (burnAddress: string, prover: ProverConfig): boolean => {
    const newBurnWatcher = {burnAddress, prover}
    const watchExist = !!burnWatchers.find((burnWatcher) => _.isEqual(burnWatcher, newBurnWatcher))
    if (!watchExist) {
      setBurnWatchers([...burnWatchers, newBurnWatcher])
    }
    return watchExist
  }

  const addBurnAddress = (burnAddress: string, info: BurnAddressInfo): void =>
    setBurnAddresses(_.merge(burnAddresses, {[burnAddress]: info}))

  const getTransactionHeight = async (txid: string | null): Promise<number | null> => {
    if (txid == null) return null
    try {
      const tx = await web3.eth.getTransaction(txid)
      return _.get('blockNumber')(tx) || null
    } catch (err) {
      console.error(err)
      return null
    }
  }

  const refreshBurnStatus = async (): Promise<void> => {
    const getBurnStatuses = async (burnWatcher: BurnWatcher): Promise<[string, BurnStatus]> => {
      try {
        const statuses = await getStatuses(burnWatcher)
        const statusesWithTxidHeight: RealBurnStatus[] = await Promise.all(
          statuses.filter(noBurnObservedFilter).map(
            async (s: BurnApiStatus): Promise<RealBurnStatus> => {
              return {
                ...s,
                burnAddressInfo: burnAddresses[burnWatcher.burnAddress],
                prover: burnWatcher.prover,
                commitment_txid_height: await getTransactionHeight(s.commitment_txid),
                redeem_txid_height: await getTransactionHeight(s.redeem_txid),
              }
            },
          ),
        )
        return [burnWatcher.burnAddress, {lastStatuses: statusesWithTxidHeight}]
      } catch (error) {
        const {burnAddress} = burnWatcher
        return [
          burnAddress,
          {
            lastStatuses: burnStatuses[burnAddress]?.lastStatuses || [],
            errorMessage: prettyErrorMessage(error),
          },
        ]
      }
    }

    const newBurnStatuses = await Promise.all(burnWatchers.map(getBurnStatuses))
    setBurnStatuses(_.fromPairs(newBurnStatuses))
  }

  const refreshBurnBalances = async (): Promise<void> => {
    const midnightAddressesByChain: Array<[ChainId, string[]]> = _.pipe(
      _.values,
      _.groupBy('chainId'),
      _.mapValues((v: Array<{midnightAddress: string}>) =>
        _.uniq(v.map(({midnightAddress}) => midnightAddress)),
      ),
      _.toPairs,
    )(burnAddresses)

    const getBurnBalance = async (chainId: ChainId, addresses: string[]): Promise<BurnBalance> => {
      const allAvailable = await Promise.all(
        addresses.map((midnightAddress) =>
          web3.erc20[chainId]
            .balanceOf(bech32toHex(midnightAddress))
            .then((balance) => deserializeBigNumber(balance))
            .catch((err) => {
              console.error(err)
              return new BigNumber(0)
            }),
        ),
      )

      const allPending = _.values(burnStatuses)
        .flatMap(({lastStatuses}) => lastStatuses)
        .filter(({status, chain}) => chain === chainId && !FINISHED_BURN_STATUSES.includes(status))
        .map((status) => new BigNumber(status.tx_value || 0))

      return {
        chain: CHAINS[chainId],
        available: bigSum(allAvailable),
        pending: bigSum(allPending),
      }
    }

    const newBurnBalances: BurnBalance[] = await Promise.all(
      midnightAddressesByChain.map(([chainId, addresses]) => getBurnBalance(chainId, addresses)),
    )
    setBurnBalances(newBurnBalances)
  }

  const refresh = async (): Promise<void> => {
    await Promise.all([refreshBurnStatus(), refreshBurnBalances()])
  }

  const observeBurnAddress = async (
    burnAddress: string,
    prover: ProverConfig,
    midnightAddress: string,
    chain: Chain,
    reward: number,
    autoConversion: boolean,
  ): Promise<void> => {
    const burnAddressFromProver = await createBurn(
      prover,
      midnightAddress,
      chain.id,
      reward,
      autoConversion,
    ).catch((err) => {
      throw new Error(
        prettyErrorMessage(err, ({message, code}) =>
          code === 1001 ? 'Reward is too low for the selected prover.' : message,
        ),
      )
    })
    if (burnAddressFromProver !== burnAddress) {
      throw new Error(
        `Something went wrong, wallet and prover generated different burn-addresses: ${burnAddress} vs ${burnAddressFromProver}`,
      )
    }
    addBurnAddress(burnAddress, {midnightAddress, chainId: chain.id, reward, autoConversion})
    addBurnWatcher(burnAddress, prover)
  }

  const reset = (): void => {
    setBurnAddresses({})
    setBurnWatchers([])
    setBurnStatuses({})
  }

  return {
    addBurnWatcher,
    burnStatuses,
    refresh,
    observeBurnAddress,
    burnBalances,
    reset,
    burnAddresses,
    addTx: proveTransaction,
    provers,
  }
}

export const ProofOfBurnState = createContainer(useProofOfBurnState)
