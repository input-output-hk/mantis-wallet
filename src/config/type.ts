export interface ProcessConfig {
  packageDirectory: string
  executableName: string
  dataDir: {
    settingName: string
    directoryName: string
  }
  additionalSettings: Record<string, string>
}

export interface ProverConfig {
  name: string
  address: string
}

// Contract addresses / network
export interface ContractConfigItem {
  networkName: string
  glacierDrop: string
  constantsRepo: string
}

export type ClientName = 'node' | 'wallet'

export interface Config {
  rpcAddress: string
  provers: ProverConfig[]
  contractConfig: ContractConfigItem[]
  dataDir: string
  distPackagesDir: string
  runClients: boolean
  clientConfigs: Record<ClientName, ProcessConfig>
  openDevTools: boolean
}

export interface LunaManagedConfig {
  selectedNetwork: string
  miningEnabled: boolean
  pkd: string
  diversifier: string
  ovk: string
}
