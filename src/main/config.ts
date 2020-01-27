/* eslint-disable fp/no-throw */
import path from 'path'
import fs from 'fs'
import {homedir} from 'os'
import convict from 'convict'
import {pipe} from 'fp-ts/lib/pipeable'
import * as array from 'fp-ts/lib/Array'
import * as _ from 'lodash/fp'

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

convict.addFormats({
  ['existing-directory']: {
    validate(val: unknown): void {
      if (typeof val != 'string') {
        throw new Error('Expected a string containing path to existing directory')
      }

      if (!fs.statSync(val).isDirectory()) {
        throw new Error(`Expected ${val} to be a path of an existing directory`)
      }
    },
  },
  ['settings-map']: {
    validate(val: unknown): void {
      if (!(val instanceof Map)) {
        throw new Error(`Expected ${JSON.stringify(val)} to be a Map`)
      }
    },
    coerce(val: unknown): Map<string, string> {
      if (val instanceof Map) {
        return pipe(
          val,
          (map) => Array.from(map.entries()),
          array.map(([key, value]: [unknown, unknown]): [string, string] => [
            _.toString(key),
            _.toString(value),
          ]),
          (entries) => new Map<string, string>(entries),
        )
      } else if (val instanceof Object) {
        return pipe(
          val,
          Object.entries,
          array.map(([key, value]): [string, string] => [_.toString(key), _.toString(value)]),
          (entries) => new Map<string, string>(entries),
        )
      } else {
        throw new Error(`Couldn't parse ${JSON.stringify(val)} to settings map`)
      }
    },
  },
})

const defaultDataDir = path.resolve(homedir(), '.luna')
const defaultDistPackagesDir = path.resolve(__dirname, '..', '..', '..', 'midnight-dist')

const clientConfig = (
  name: ClientName,
  defaults: ProcessConfig,
): convict.Schema<ProcessConfig> => ({
  packageDirectory: {
    default: defaults.packageDirectory,
    arg: `${name}-package-directory`,
    env: `LUNA_${name.toUpperCase()}_PACKAGE_DIRECTORY`,
    doc: `Directory (prefferably under distPackagesDir), where ${name} build is stored`,
    format: 'existing-directory',
  },
  executableName: {
    default: defaults.executableName,
    arg: `${name}-executable-name`,
    env: `LUNA_${name}_EXECUTABLE_NAME`,
    doc: `Name of executable to run ${name}`,
  },
  additionalSettings: {
    default: defaults.additionalSettings,
    arg: `${name}-additional-settings`,
    env: `LUNA_${name.toUpperCase()}_ADDITIONAL_SETTINGS`,
    doc: `Additional settings for running ${name}`,
    format: 'settings-map',
  },
})

const configGetter = convict({
  dataDir: {
    default: defaultDataDir,
    arg: 'data-dir',
    env: 'LUNA_DATA_DIR',
    doc: 'Directory, where Luna stores its all data',
  },
  runClients: {
    default: true,
    arg: 'run-clients',
    env: 'LUNA_RUN_CLIENTS',
    doc: 'Whether to run wallet backend and Midnight node on its own or not',
  },
  distPackagesDir: {
    default: path.resolve(__dirname, '..', '..', '..', 'midnight-dist'),
    arg: 'dist-packages-dir',
    env: 'LUNA_DIST_PACKAGES_DIR',
    doc: 'Directory, which contains distribution packages of node and wallet',
    format: 'existing-directory',
  },
  clientConfigs: {
    node: clientConfig('node', {
      packageDirectory: path.resolve(defaultDistPackagesDir, 'midnight-node-1.0'),
      executableName: 'midnight-node', //
      additionalSettings: new Map([
        ['midnight.datadir', path.resolve(defaultDataDir, 'node')], // Directory, where node stores its data
      ]),
    }),
    wallet: clientConfig('wallet', {
      packageDirectory: path.resolve(defaultDistPackagesDir, 'midnight-wallet-1.0'),
      executableName: 'midnight-wallet',
      additionalSettings: new Map([
        ['wallet.datadir', path.resolve(defaultDataDir, 'wallet')], // Directory, where wallet backend stores its data
        ['midnight.network.rpc.http.cors-allowed-origins', '*'], // Make it possible for Luna to access Wallet's RPC
      ]),
    }),
  },
})
;[
  {name: 'platform-specific', path: path.resolve(__dirname, 'platform-config.json5')},
  {name: 'app config', path: path.resolve(__dirname, 'config.json5')},
  {name: 'environment variable LUNA_CONFIG_FILE', path: process.env.LUNA_CONFIG_FILE || ''},
]
  .map((configSource) => ({
    ...configSource,
    doesExist: fs.existsSync(configSource.path),
  }))
  .forEach((configSource) => {
    if (!configSource.doesExist) {
      console.warn(
        `Tried to load ${configSource.name}, (resolved to: ${configSource.path}) but it doesn't exist. Skipping`,
      )
    } else {
      configGetter.loadFile(configSource.path)
    }
  })

export const config: Config = configGetter.getProperties() as Config
