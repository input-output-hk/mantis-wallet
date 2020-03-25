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

export type ClientName = 'node' | 'wallet'

export interface Config {
  rpcAddress: string
  provers: ProverConfig[]
  dataDir: string
  distPackagesDir: string
  runClients: boolean
  clientConfigs: Record<ClientName, ProcessConfig>
  openDevTools: boolean
}
