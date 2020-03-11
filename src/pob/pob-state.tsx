import {useState} from 'react'
import _ from 'lodash/fp'
import {createContainer} from 'unstated-next'
import {getStatuses, createBurn, BurnApiStatus, NO_BURN_OBSERVED} from './api/prover'
import {Chain} from './chains'
import {ProverConfig} from '../config/type'

export interface BurnWatcher {
  burnAddress: string
  prover: ProverConfig
}

export type BurnStatus = {
  lastStatuses: BurnApiStatus[]
  error?: Error
}

interface ProofOfBurnState {
  addBurnWatcher: (burnAddress: string, prover: ProverConfig) => boolean
  observeBurnAddress: (
    burnAddress: string,
    prover: ProverConfig,
    midnightaddress: string,
    chain: Chain,
    reward: number,
    autoConversion: boolean,
  ) => Promise<void>
  burnStatuses: Record<string, BurnStatus>
  refreshBurnStatus: () => Promise<void>
}

function useProofOfBurnState(): ProofOfBurnState {
  const [burnWatchers, setBurnWatchers] = useState<BurnWatcher[]>([])
  const [burnStatuses, setBurnStatuses] = useState<Record<string, BurnStatus>>({})

  const addBurnWatcher = (burnAddress: string, prover: ProverConfig): boolean => {
    const newBurnWatcher = {burnAddress, prover}
    const watchExist = !!burnWatchers.find((burnWatcher) => _.isEqual(burnWatcher, newBurnWatcher))
    if (!watchExist) {
      setBurnWatchers([...burnWatchers, newBurnWatcher])
    }
    return watchExist
  }

  const refreshBurnStatus = async (): Promise<void> => {
    const newBurnStatuses = await Promise.all(
      burnWatchers.map((burnWatcher) =>
        getStatuses(burnWatcher)
          .then((statuses): [string, BurnStatus] => [
            burnWatcher.burnAddress,
            {lastStatuses: statuses},
          ])
          .catch((error): [string, BurnStatus] => {
            const {burnAddress} = burnWatcher
            return [
              burnAddress,
              {
                lastStatuses: burnStatuses[burnAddress]?.lastStatuses || [
                  {
                    status: NO_BURN_OBSERVED,
                  },
                ],
                error,
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
