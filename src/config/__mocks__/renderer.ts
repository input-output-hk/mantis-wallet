import {Config, ContractConfigItem, LunaManagedConfig} from '../type'

export const config: Config = {
  rpcAddress: 'localhost:1234',
} as Config

export const loadConfig = (): Config => config

export const loadLunaManagedConfig = (): LunaManagedConfig => ({
  selectedNetwork: 'development',
  miningEnabled: false,
  pkd: '',
  ovk: '',
  diversifier: '',
})

export const getContractAddresses = (): Record<string, ContractConfigItem> => ({
  development: {
    networkName: 'development',
    glacierDrop: '',
    constantsRepo: '',
  },
})
