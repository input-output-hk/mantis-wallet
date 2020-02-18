import {useState} from 'react'
import _ from 'lodash/fp'
import {createContainer} from 'unstated-next'
import * as prover from './api/prover'
import {ProverConfig} from '../config/type'

export interface BurnWatcher {
  burnAddress: string
  prover: ProverConfig
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type BurnStatus = prover.BurnApiStatus | any

interface ProofOfBurnState {
  addBurnWatcher: (burnAddress: string, prover: ProverConfig) => boolean
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
        prover
          .getStatus(burnWatcher)
          .then((status): [BurnWatcher, BurnStatus] => [burnWatcher, status])
          .catch((error): [BurnWatcher, BurnStatus] => [burnWatcher, error]),
      ),
    )
    setBurnStatuses(burnStatuses)
  }

  return {
    addBurnWatcher,
    burnStatuses,
    refreshBurnStatus,
  }
}

export const ProofOfBurnState = createContainer(useProofOfBurnState)
