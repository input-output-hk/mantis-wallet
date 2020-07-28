import {useState, useEffect} from 'react'
import _ from 'lodash/fp'
import * as Comlink from 'comlink'
import BigNumber from 'bignumber.js'
import {fromUnixTime} from 'date-fns'
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
import {PobChain, PobChainId} from './pob-chains'
import {ProverConfig} from '../config/type'
import {Store, createInMemoryStore} from '../common/store'
import {usePersistedState} from '../common/hook-utils'
import {Web3API, makeWeb3Worker} from '../web3'
import {config} from '../config/renderer'
import {prop} from '../shared/utils'
import {rendererLog} from '../common/logger'

export interface BurnWatcher {
  burnAddress: string
  prover: ProverConfig
}

export interface BurnAddressInfo {
  midnightAddress: string
  chainId: PobChainId
  reward: number
  autoConversion: boolean
}

export interface RealBurnStatus extends BurnApiStatus {
  commitment_tx_height: number | null
  redeem_tx_height: number | null
  redeem_tx_timestamp: Date | null
  isHidden: boolean
}

export type BurnStatus = {
  burnWatcher: BurnWatcher
  lastStatuses: RealBurnStatus[]
  errorMessage?: string
  isHidden: boolean
}

export interface Prover extends ProverConfig {
  rewards: Partial<Record<PobChainId, number>>
}

export interface ProofOfBurnData {
  addBurnWatcher: (burnAddress: string, prover: ProverConfig) => boolean
  hideBurnWatcher: (burnWatcher: BurnWatcher, hide: boolean) => void
  observeBurnAddress: (
    burnAddress: string,
    prover: ProverConfig,
    midnightAddress: string,
    chain: PobChain,
    reward: number,
    autoConversion: boolean,
  ) => Promise<void>
  burnStatuses: BurnStatus[]
  hideBurnProcess: (burnWatcher: BurnWatcher, txId: string, hide: boolean) => void
  refresh: () => Promise<void>
  reset: () => void
  burnAddresses: Record<string, BurnAddressInfo>
  addTx: (prover: ProverConfig, burnTx: string, burnAddress: string) => Promise<void>
  provers: Prover[]
  pendingBalances: Partial<Record<PobChainId, BigNumber>>
}

export type StorePobData = {
  pob: {
    burnWatchers: BurnWatcher[]
    burnAddresses: Record<string, BurnAddressInfo>
    hiddenBurnProcesses: Record<string, 'all' | string[]>
  }
}

export const defaultPobData: StorePobData = {
  pob: {
    burnWatchers: [],
    burnAddresses: {},
    hiddenBurnProcesses: {},
  },
}

const FINISHED_BURN_STATUSES: BurnStatusType[] = [
  'redeem_appeared',
  'redeem_another_prover',
  'proof_fail',
  'commitment_fail',
  'redeem_fail',
]

const getBurnStatusKey = ({burnAddress, prover: {address}}: BurnWatcher): string =>
  `${burnAddress} ${address}`

export const getPendingBalance = (
  burnStatuses: BurnStatus[],
  burnAddresses: Record<string, BurnAddressInfo>,
): Partial<Record<PobChainId, BigNumber>> =>
  _.pipe(
    _.flatMap(({lastStatuses, burnWatcher: {burnAddress}}: BurnStatus) =>
      lastStatuses.map((status) => ({
        burnAddress,
        txId: status.txid,
        chainId: burnAddresses[burnAddress].chainId,
        status: status.status,
        txValue: status.tx_value,
        proverReward: burnAddresses[burnAddress].reward,
      })),
    ),
    _.filter(({status, txValue}) => !FINISHED_BURN_STATUSES.includes(status) && txValue != null),
    _.uniqWith(
      (arrVal, othVal) => arrVal.burnAddress === othVal.burnAddress && arrVal.txId === othVal.txId,
    ),
    _.map(({chainId, txValue, proverReward}) => ({
      [chainId]: new BigNumber(txValue || 0).minus(proverReward),
    })),
    _.mergeAllWith((v: BigNumber, s: BigNumber) => (v ? v.plus(s) : s)),
  )(burnStatuses)

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
  const [hiddenBurnProcesses, setHiddenBurnProcesses] = usePersistedState(store, [
    'pob',
    'hiddenBurnProcesses',
  ])
  const [burnStatuses, setBurnStatuses] = useState<Record<string, BurnStatus>>({})
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
            rendererLog.error(err)
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
      rendererLog.error(err)
      return null
    }
  }

  const getBlockDate = async (blockNumber: number | null): Promise<Date | null> => {
    if (blockNumber == null) return null
    try {
      const timestamp = (await web3.eth.getBlock(blockNumber, false))?.timestamp
      return timestamp == null ? null : fromUnixTime(new BigNumber(timestamp).toNumber())
    } catch (err) {
      rendererLog.error(err)
      return null
    }
  }

  const refreshBurnStatus = async (): Promise<void> => {
    const getBurnStatuses = async (burnWatcher: BurnWatcher): Promise<[string, BurnStatus]> => {
      const burnStatusKey = getBurnStatusKey(burnWatcher)
      try {
        const statuses = await getStatuses(burnWatcher)
        const statusesWithTxidHeight: RealBurnStatus[] = await Promise.all(
          statuses.filter(noBurnObservedFilter).map(
            async (s: BurnApiStatus): Promise<RealBurnStatus> => {
              const redeemTxHeight = await getTransactionHeight(s.redeem_txid)
              return {
                ...s,
                commitment_tx_height: await getTransactionHeight(s.commitment_txid),
                redeem_tx_height: redeemTxHeight,
                redeem_tx_timestamp: await getBlockDate(redeemTxHeight),
                isHidden:
                  hiddenBurnProcesses[burnStatusKey] === 'all' ||
                  (hiddenBurnProcesses[burnStatusKey] || []).includes(s.txid),
              }
            },
          ),
        )
        return [
          burnStatusKey,
          {
            burnWatcher,
            lastStatuses: statusesWithTxidHeight,
            isHidden: hiddenBurnProcesses[burnStatusKey] === 'all',
          },
        ]
      } catch (error) {
        return [
          burnStatusKey,
          {
            burnWatcher,
            lastStatuses: burnStatuses[burnStatusKey]?.lastStatuses || [],
            errorMessage: prettyErrorMessage(error),
            isHidden: hiddenBurnProcesses[burnStatusKey] === 'all',
          },
        ]
      }
    }

    const newBurnStatuses = await Promise.all(burnWatchers.map(getBurnStatuses))
    const newBurnStatusesAsMap = _.fromPairs(newBurnStatuses)

    // Avoid unnecessary updates
    if (!_.isEqual(burnStatuses, newBurnStatusesAsMap)) {
      rendererLog.debug('New burn statuses', newBurnStatusesAsMap)
      setBurnStatuses(newBurnStatusesAsMap)
    }
  }

  const refresh = async (): Promise<void> => refreshBurnStatus()

  const observeBurnAddress = async (
    burnAddress: string,
    prover: ProverConfig,
    midnightAddress: string,
    chain: PobChain,
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
      throw Error(
        prettyErrorMessage(err, ({message, code}) =>
          code === 1001 ? 'Reward is too low for the selected prover.' : message,
        ),
      )
    })
    if (burnAddressFromProver !== burnAddress) {
      throw Error(
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

  const hideBurnWatcher = (burnWatcher: BurnWatcher, hide: boolean): void => {
    const burnStatusKey = getBurnStatusKey(burnWatcher)
    if (hide) {
      setHiddenBurnProcesses({
        ...hiddenBurnProcesses,
        [burnStatusKey]: 'all',
      })
    } else {
      setHiddenBurnProcesses(_.unset(burnStatusKey)(hiddenBurnProcesses))
    }
  }

  const hideBurnProcess = (burnWatcher: BurnWatcher, txId: string, hide: boolean): void => {
    const burnStatusKey = getBurnStatusKey(burnWatcher)
    const burnStatus = burnStatuses[burnStatusKey]

    const hiddenByThisBurnWatcher =
      hiddenBurnProcesses[burnStatusKey] === 'all'
        ? burnStatus.lastStatuses.map(prop('txid'))
        : hiddenBurnProcesses[burnStatusKey] || []

    setHiddenBurnProcesses({
      ...hiddenBurnProcesses,
      [burnStatusKey]: hide
        ? [...hiddenByThisBurnWatcher, txId]
        : _.without([txId])(hiddenByThisBurnWatcher),
    })
  }

  return {
    addBurnWatcher,
    hideBurnWatcher,
    burnStatuses: _.values(burnStatuses),
    hideBurnProcess,
    pendingBalances: getPendingBalance(_.values(burnStatuses), burnAddresses),
    refresh,
    observeBurnAddress,
    reset,
    burnAddresses,
    addTx: proveTransaction,
    provers,
  }
}

export const ProofOfBurnState = createContainer(useProofOfBurnState)

export const migrationsForPobData = {
  '0.14.0-alpha.2': (store: Store<StorePobData>) => {
    store.set('pob', {
      ...store.get('pob'),
      hiddenBurnProcesses: defaultPobData.pob.hiddenBurnProcesses,
    })
  },
}
