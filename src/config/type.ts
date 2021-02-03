import {URL} from 'url'
import {Option} from 'fp-ts/lib/Option'
import * as T from 'io-ts'
import {TLSConfig} from '../main/tls'
import {TFunctionRenderer} from '../common/i18n'
import {TFunctionMain} from '../main/i18n'

export type ClientSettings = Record<string, string | boolean | number | null>

export interface MantisConfig {
  packageDirectory: string
  executableName: string
  additionalSettings: ClientSettings
  dataDir: string | null
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

export const displayNameOfNetwork = (networkName: NetworkName, t: TFunctionRenderer): string => {
  if (isDefinedNetworkName(networkName)) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    return t(['network', 'names', networkName])
  } else {
    return networkName
  }
}

// We need separate function for main proccess, otherwise we get following error:
// Type instantiation is excessively deep and possibly infinite
export const displayNameOfNetworkMain = (networkName: NetworkName, t: TFunctionMain): string => {
  if (isDefinedNetworkName(networkName)) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    return t(['network', 'names', networkName])
  } else {
    return networkName
  }
}

export interface Config {
  rpcAddress: URL
  networkName: NetworkName
  walletDataDir: string
  distPackagesDir: string
  runNode: boolean
  mantis: MantisConfig
  openDevTools: boolean
  tls: Option<TLSConfig>
}
