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
  [T.literal('etc'), T.literal('mordor'), T.literal('testnet-internal'), T.string],
  'networkName',
)
export type NetworkName = T.TypeOf<typeof NetworkName>

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
