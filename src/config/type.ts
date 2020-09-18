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

export const NetworkName = T.union(
  [T.literal('etc'), T.literal('mordor'), T.literal('private'), T.literal('test')],
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
