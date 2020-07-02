import {useState} from 'react'
import _ from 'lodash/fp'
import {createContainer} from 'unstated-next'
import {Remote} from 'comlink'
import {message} from 'antd'
import {makeWeb3Worker, Web3API, JobStatus} from '../web3'
import {rendererLog} from './logger'

type BuiltCallback = (txHash: string) => void

export interface BuildJobState {
  jobStatuses: Record<string, JobStatus>
  submitJob(jobHash: string, callback?: BuiltCallback): Promise<void>
  refresh(): Promise<void>
}

interface BuildJobStateParams {
  web3: Remote<Web3API>
}

const DEFAULT_STATE: BuildJobStateParams = {
  web3: makeWeb3Worker(),
}

function useBuildJobState(initialState?: Partial<BuildJobStateParams>): BuildJobState {
  const _initialState = _.merge(DEFAULT_STATE)(initialState)
  const {wallet} = _initialState.web3.midnight

  const [jobStatuses, setJobStatuses] = useState<Record<string, JobStatus>>({})
  const [callbacks, setCallbacks] = useState<Record<string, BuiltCallback>>({})

  const updateJobs = (newJobStatuses: JobStatus[]): void => {
    if (_.isEmpty(newJobStatuses)) return // avoid unnecessary update
    rendererLog.debug(`New job statuses`, newJobStatuses)
    const newJobStatusesByHash = _.keyBy((j: JobStatus) => j.hash)(newJobStatuses)
    setJobStatuses({...jobStatuses, ...newJobStatusesByHash})
  }

  const submitJob = async (
    jobHash: string,
    callback: BuiltCallback = () => undefined,
  ): Promise<void> => {
    if (jobHash in jobStatuses) {
      throw Error(`Job ${jobHash} already added`)
    }
    const jobStatus = await wallet.getTransactionBuildJobStatus(jobHash)
    setJobStatuses({...jobStatuses, [jobHash]: jobStatus})
    setCallbacks({...callbacks, [jobHash]: callback})
  }

  const refresh = async (): Promise<void> => {
    if (_.isEmpty(jobStatuses)) return // avoid unnecessary update

    const newJobStatuses = await Promise.all(
      Object.values(jobStatuses)
        .filter((jobStatus) => jobStatus.status === 'building')
        .map(async (jobStatus) => {
          const newJobStatus = await wallet.getTransactionBuildJobStatus(jobStatus.hash)
          return newJobStatus.status === jobStatus.status ? null : newJobStatus
        }),
    )
    const toUpdate: JobStatus[] = newJobStatuses.filter((x): x is JobStatus => x !== null)

    updateJobs(toUpdate)

    toUpdate.map((jobStatus) => {
      if (jobStatus.status === 'built') {
        callbacks[jobStatus.hash](jobStatus.txHash)
      } else if (jobStatus.status == 'failed') {
        message.error({content: jobStatus.reason, duration: 10}) // FIXME: handle in JobStatus component
        rendererLog.error(jobStatus.reason)
      }
    })
  }

  return {
    jobStatuses,
    submitJob,
    refresh,
  }
}

export const BuildJobState = createContainer(useBuildJobState)
