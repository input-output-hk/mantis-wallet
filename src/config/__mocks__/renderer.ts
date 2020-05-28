import {Config, ContractConfigItem, LunaManagedConfig} from '../type'

export const config: Config = {
  rpcAddress: 'localhost:1234',
} as Config

export const loadConfig = (): Config => config

export const loadLunaStatus = (): LunaStatus => ({
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
  },
  info: {
    platform: 'Linux',
    platformVersion: 'Linux X',
    cpu: 'Intel',
    memory: 16000000,

    lunaVersion: '0.11.0',
    mainPid: 1234,
  },
})

export const loadLunaManagedConfig = (): LunaManagedConfig => ({
  selectedNetwork: 'testnet',
  miningEnabled: false,
  pkd: '',
  ovk: '',
  diversifier: '',
})

export const getContractAddresses = (): Record<string, ContractConfigItem> => ({
  testnet: {
    networkName: 'testnet',
    glacierDrop: '',
    constantsRepo: '',
  },
})
