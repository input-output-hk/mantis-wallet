import {remote} from 'electron'
import {pipe} from 'fp-ts/lib/pipeable'
import {Config} from './type'

export const loadConfig = (): Config =>
  pipe(remote.getGlobal('lunaConfig'), (cfg) => ({...cfg, rpcAddress: new URL(cfg.rpcAddress)}))

export const loadLunaStatus = (): LunaStatus => remote.getGlobal('lunaStatus')

// static config
export const config: Config = loadConfig()
