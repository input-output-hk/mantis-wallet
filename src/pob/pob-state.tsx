import {useState} from 'react'
import _ from 'lodash/fp'
import * as Comlink from 'comlink'
import * as tPromise from 'io-ts-promise'
import BigNumber from 'bignumber.js'
import {createContainer} from 'unstated-next'
import {
  getStatuses,
  createBurn,
  BurnApiStatus,
  noBurnObservedFilter,
  proveTransaction,
} from './api/prover'
import {Chain, ChainId, CHAINS} from './chains'
import {ProverConfig} from '../config/type'
import {Store, defaultPobData, createInMemoryStore, StorePobData} from '../common/store'
import {usePersistedState} from '../common/hook-utils'
import {Web3API, makeWeb3Worker} from '../web3'
import {deserializeBigNumber, bigSum, bech32toHex} from '../common/util'

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

export type BurnStatus = {
  lastStatuses: BurnApiStatus[]
  errorMessage?: string
}

const prettyErrorMessage = (error: Error): string =>
  tPromise.isDecodeError(error)
    ? 'Unexpected response from prover.'
    : 'Unexpected error while communicating with prover.'

export type BurnBalance = {
  chain: Chain
  pending: BigNumber
  available: BigNumber
}

interface ProofOfBurnState {
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
  addTx: (prover: ProverConfig, burnTx: string, burnInfo: BurnAddressInfo) => Promise<void>
}

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
): ProofOfBurnState {
  const [burnWatchers, setBurnWatchers] = usePersistedState(store, ['pob', 'burnWatchers'])
  const [burnAddresses, setBurnAddresses] = usePersistedState(store, ['pob', 'burnAddresses'])
  const [burnStatuses, setBurnStatuses] = useState<Record<string, BurnStatus>>({})
  const [burnBalances, setBurnBalances] = useState<BurnBalance[]>([])

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

  const refreshBurnStatus = async (): Promise<void> => {
    const newBurnStatuses = await Promise.all(
      burnWatchers.map((burnWatcher) =>
        getStatuses(burnWatcher)
          .then((statuses): [string, BurnStatus] => [
            burnWatcher.burnAddress,
            {lastStatuses: statuses.filter(noBurnObservedFilter)},
          ])
          .catch((error): [string, BurnStatus] => {
            const {burnAddress} = burnWatcher
            return [
              burnAddress,
              {
                lastStatuses: burnStatuses[burnAddress]?.lastStatuses || [],
                errorMessage: prettyErrorMessage(error),
              },
            ]
          }),
      ),
    )
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

      return {
        chain: CHAINS[chainId],
        available: bigSum(allAvailable),
        pending: new BigNumber(0),
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
    )
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
  }
}

export const ProofOfBurnState = createContainer(useProofOfBurnState)
