import {remote} from 'electron'
import {Config, LunaManagedConfig} from './type'

export const loadConfig = (): Config => remote.getGlobal('lunaConfig')

export const loadLunaStatus = (): LunaStatus => remote.getGlobal('lunaStatus')

export const loadLunaManagedConfig = (): LunaManagedConfig => remote.getGlobal('lunaManagedConfig')

// static config
export const config: Config = loadConfig()
