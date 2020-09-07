import {Option} from 'fp-ts/lib/Option'
import {TLSConfig} from '../main/tls'

export type ClientSettings = Record<string, string | boolean | number | null>
export type SettingsPerClient = Record<ClientName, ClientSettings>
export const SettingsPerClient = (data: Partial<SettingsPerClient>): SettingsPerClient => ({
  node: {},
  wallet: {},
  ...data,
})

export interface ProcessConfig {
  packageDirectory: string
  executableName: string
  dataDir: {
    settingName: string
    directoryName: string
  }
  additionalSettings: ClientSettings
}

export type ClientName = 'node' | 'wallet'
export const clientNames: ClientName[] = ['node', 'wallet']

export interface Config {
  rpcAddress: string
  nodeRpcAddress: string
  nodeRpcPort: number
  walletRpcPort: number
  discoveryPort: number
  p2pMessagingPort: number
  blocksStreamingPort: number
  dataDir: string
  distPackagesDir: string
  runClients: boolean
  clientConfigs: Record<ClientName, ProcessConfig>
  openDevTools: boolean
  tls: Option<TLSConfig>
}

export interface LunaManagedConfig {
  miningEnabled: boolean
  pkd: string
  diversifier: string
  ovk: string
}
