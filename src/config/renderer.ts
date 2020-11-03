import {remote} from 'electron'
import {pipe} from 'fp-ts/lib/pipeable'
import _ from 'lodash/fp'
import {Config} from './type'

export const loadConfig = (): Config =>
  pipe(remote.getGlobal('mantisWalletConfig'), (cfg) => ({
    ...cfg,
    rpcAddress: new URL(cfg.rpcAddress),
  }))

export const loadMantisWalletStatus = (): MantisWalletStatus =>
  _.clone(remote.getGlobal('mantisWalletStatus'))

// static config
export const config: Config = loadConfig()
