/* eslint-disable fp/no-mutation */
import os from 'os'
import {MANTIS_WALLET_VERSION} from '../shared/version'
import {PROGRESS_FOR_DAG, FAILURE_FOR_DAG, SUCCESS_FOR_DAG} from '../shared/dagStatus'

export const status: MantisWalletStatus = {
  node: {
    status: 'notRunning',
  },
  dag: {
    status: 'notRunning',
    message: '',
  },
  info: {
    platform: os.type(),
    platformVersion: os.release(),
    cpu: os.cpus()[0].model,
    memory: os.totalmem(),

    mantisWalletVersion: MANTIS_WALLET_VERSION,
    mainPid: process.pid,
  },
}

export function setMantisStatus(processInfo: {pid?: number; status: ProcessStatus}): void {
  status.node = processInfo
}

export function inspectLineForDAGStatus(line: string): void {
  const failure = FAILURE_FOR_DAG.find((failure) => line.includes(failure))
  if (failure) {
    status.dag.message = failure
    status.dag.status = 'failed'
    return
  }

  const success = SUCCESS_FOR_DAG.find((success) => line.includes(success))
  if (success) {
    status.dag.message = success
    status.dag.status = 'finished'
    return
  }

  PROGRESS_FOR_DAG.map((progressRegex) => line.match(progressRegex))
    .filter((res): res is RegExpMatchArray => res != null)
    .forEach((res) => {
      status.dag.status = 'running'
      status.dag.message = res[0]
    })
}
