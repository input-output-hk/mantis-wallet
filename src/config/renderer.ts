import {remote} from 'electron'
import {Config} from './type'

export const loadConfig = (): Config => remote.getGlobal('lunaConfig')

export const loadLunaStatus = (): LunaStatus => remote.getGlobal('lunaStatus')

// static config
export const config: Config = loadConfig()
