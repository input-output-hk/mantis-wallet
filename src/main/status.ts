/* eslint-disable fp/no-mutation */
import os from 'os'
import {ClientName} from '../config/type'
import {LUNA_VERSION} from '../shared/version'

const progressForDAG = [/Generating DAG \d+%/, /Loading DAG from file \d+%/] as const

const failuresForDAG = [
  'DAG file ended unexpectedly',
  'Invalid DAG file prefix',
  'Cannot read DAG from file',
  'Cannot generate DAG file',
] as const

const successesForDAG = ['DAG file loaded successfully', 'DAG file generated successfully'] as const

export const status: LunaStatus = {
  fetchParams: {
    status: 'not-running',
  },
  wallet: {
    status: 'not-running',
  },
  node: {
    status: 'not-running',
  },
  dag: {
    status: 'not-running',
    message: '',
  },
  info: {
    platform: os.type(),
    platformVersion: os.release(),
    cpu: os.cpus()[0].model,
    memory: os.totalmem(),

    lunaVersion: LUNA_VERSION,
    mainPid: process.pid,
  },
}

export function setFetchParamsStatus(processStatus: ProcessStatus): void {
  status.fetchParams.status = processStatus
}

export function setProcessStatus(
  clientName: ClientName,
  processInfo: {pid?: number; status: ProcessStatus},
): void {
  status[clientName] = processInfo
}

export function inspectLineForDAGStatus(line: string): void {
  const failure = failuresForDAG.find((failure) => line.includes(failure))
  if (failure) {
    status.dag.message = failure
    status.dag.status = 'failed'
    return
  }

  const success = successesForDAG.find((success) => line.includes(success))
  if (success) {
    status.dag.message = success
    status.dag.status = 'finished'
    return
  }

  progressForDAG
    .map((progressRegex) => line.match(progressRegex))
    .filter((res): res is RegExpMatchArray => res != null)
    .forEach((res) => {
      status.dag.status = 'running'
      status.dag.message = res[0]
    })
}
