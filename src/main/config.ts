import {resolve} from 'path'
import {homedir} from 'os'

export interface ProcessConfig {
  packageDirectory: string
  executableName: string
  additionalSettings: Map<string, string>
}

export type ClientName = 'node' | 'wallet'

export interface Config {
  dataDir: string
  distPackagesDir: string
  runClients: boolean
  clientConfigs: Record<ClientName, ProcessConfig>
}

const defaults = ((): Config => {
  const dataDir = resolve(homedir(), '.luna')
  const distPackagesDir = resolve(__dirname, '..', '..', '..', 'midnight-dist')

  return {
    dataDir, //Directory, where Luna stores its all data
    runClients: false, //Whether to run wallet backend and Midnight node on its own or not
    distPackagesDir, //Directory, which contains distribution packages of node and wallet
    clientConfigs: {
      node: {
        packageDirectory: resolve(distPackagesDir, 'midnight-node-1.0'), //Directory under distPackagesDir, where node build is stored
        executableName: 'midnight-node', //Name of executable to run node
        additionalSettings: new Map([
          ['midnight.datadir', resolve(dataDir, 'node')], // Directory, where node stores its data
        ]),
      },
      wallet: {
        packageDirectory: resolve(distPackagesDir, 'midnight-wallet-1.0'), //Directory under distPackagesDir, where wallet build is stored
        executableName: 'midnight-wallet', //Name of executable to run wallet
        additionalSettings: new Map([
          ['wallet.datadir', resolve(dataDir, 'wallet')], // Directory, where wallet backend stores its data
          ['midnight.network.rpc.http.cors-allowed-origins', '*'], // Make it possible for Luna to access Wallet's RPC
        ]),
      },
    },
  }
})()

export const config: Config = {
  ...defaults,
  runClients: true,
}
