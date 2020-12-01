/* eslint-disable fp/no-mutation */
import os from 'os'
import {MANTIS_WALLET_VERSION} from '../shared/version'

export const status: MantisWalletStatus = {
  node: {
    status: 'notRunning',
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
