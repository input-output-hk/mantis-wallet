import {useState} from 'react'
import _ from 'lodash/fp'
import * as tPromise from 'io-ts-promise'
import {createContainer} from 'unstated-next'
import {getStatuses, createBurn, BurnApiStatus, noBurnObservedFilter} from './api/prover'
import {Chain, ChainId} from './chains'
import {ProverConfig} from '../config/type'
import {Store, defaultPobData, createInMemoryStore, StorePobData} from '../common/store'
import {usePersistedState} from '../common/hook-utils'

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
  refreshBurnStatus: () => Promise<void>
}

function useProofOfBurnState(
  store: Store<StorePobData> = createInMemoryStore(defaultPobData),
): ProofOfBurnState {
  const [burnWatchers, setBurnWatchers] = usePersistedState(store, ['pob', 'burnWatchers'])
  const [burnAddresses, setBurnAddresses] = usePersistedState(store, ['pob', 'burnAddresses'])
  const [burnStatuses, setBurnStatuses] = useState<Record<string, BurnStatus>>({})

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
      // Disabled for fp/no-throw, storybook fails if we specify the rule
      // eslint-disable-next-line
      throw new Error(
        `Something went wrong, wallet and prover generated different burn-addresses: ${burnAddress} vs ${burnAddressFromProver}`,
      )
    }
    addBurnAddress(burnAddress, {midnightAddress, chainId: chain.id, reward, autoConversion})
    addBurnWatcher(burnAddress, prover)
  }

  return {
    addBurnWatcher,
    burnStatuses,
    refreshBurnStatus,
    observeBurnAddress,
  }
}

export const ProofOfBurnState = createContainer(useProofOfBurnState)
