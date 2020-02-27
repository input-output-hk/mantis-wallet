import {useState} from 'react'
import _ from 'lodash/fp'
import {createContainer} from 'unstated-next'
import {getStatus, createBurn, BurnApiStatus} from './api/prover'
import {Chain} from './chains'
import {ProverConfig} from '../config/type'

export interface BurnWatcher {
  burnAddress: string
  prover: ProverConfig
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type BurnStatus = BurnApiStatus | any

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
  burnStatuses: Array<[BurnWatcher, BurnStatus]>
  refreshBurnStatus: () => Promise<void>
}

function useProofOfBurnState(): ProofOfBurnState {
  const [burnWatchers, setBurnWatchers] = useState<BurnWatcher[]>([])
  const [burnStatuses, setBurnStatuses] = useState<Array<[BurnWatcher, BurnStatus]>>([])

  const addBurnWatcher = (burnAddress: string, prover: ProverConfig): boolean => {
    const newBurnWatcher = {burnAddress, prover}
    const watchExist = !!burnWatchers.find((burnWatcher) => _.isEqual(burnWatcher, newBurnWatcher))
    if (!watchExist) {
      setBurnWatchers([...burnWatchers, newBurnWatcher])
    }
    return watchExist
  }

  const refreshBurnStatus = async (): Promise<void> => {
    const burnStatuses = await Promise.all(
      burnWatchers.map((burnWatcher) =>
        getStatus(burnWatcher)
          .then((status): [BurnWatcher, BurnStatus] => [burnWatcher, status])
          .catch((error): [BurnWatcher, BurnStatus] => [burnWatcher, error]),
      ),
    )
    setBurnStatuses(burnStatuses)
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
