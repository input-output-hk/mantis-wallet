import _ from 'lodash/fp'
import {remote} from 'electron'
import {Config, ContractConfigItem, LunaManagedConfig} from './type'

export const loadConfig = (): Config => remote.getGlobal('lunaConfig')

export const loadLunaManagedConfig = (): LunaManagedConfig => remote.getGlobal('lunaManagedConfig')

// static config
export const config: Config = loadConfig()

export const getContractAddresses = (): Record<string, ContractConfigItem> =>
  _.keyBy((c: ContractConfigItem) => c.networkName)(loadConfig().contractConfig)
