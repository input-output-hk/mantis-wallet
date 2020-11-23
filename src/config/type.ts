import {URL} from 'url'
import {Option} from 'fp-ts/lib/Option'
import * as T from 'io-ts'
import {TLSConfig} from '../main/tls'

export type ClientSettings = Record<string, string | boolean | number | null>

export interface MantisConfig {
  packageDirectory: string
  executableName: string
  dataDirName: string
  additionalSettings: ClientSettings
}

// Known predefined networks + anything else if user configures it on its own
export const NetworkName = T.union(
  [T.literal('etc'), T.literal('mordor'), T.literal('testnet-internal-nomad'), T.string],
  'networkName',
)
export type NetworkName = T.TypeOf<typeof NetworkName>

export const DEFINED_NETWORK_NAMES = ['testnet-internal-nomad', 'etc', 'mordor'] as const
export type DefinedNetworkName = typeof DEFINED_NETWORK_NAMES[number]
export const isDefinedNetworkName = (networkName: NetworkName): networkName is DefinedNetworkName =>
  (DEFINED_NETWORK_NAMES as readonly string[]).includes(networkName)

export const displayNameOfNetwork = (networkName: NetworkName): string => {
  // An exception due to configuration issues and a secondary GAC-based deployment just in case, didn't want to open
  // can of worms related to keeping both config name and display name due to that single value that probably is
  // going to be removed/adjusted anyway
  if (networkName == 'testnet-internal-nomad') {
    return 'testnet-internal'
  } else if (isDefinedNetworkName(networkName)) {
    return networkName
  } else {
    return 'custom'
  }
}

export interface Config {
  rpcAddress: URL
  networkName: NetworkName
  dataDir: string
  distPackagesDir: string
  runNode: boolean
  mantis: MantisConfig
  openDevTools: boolean
  tls: Option<TLSConfig>
}
