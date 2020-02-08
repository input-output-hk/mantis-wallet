// Convict formats require throwing errors to validate values
/* eslint-disable fp/no-throw */
import path from 'path'
import fs from 'fs'
import * as os from 'os'
import {homedir} from 'os'
import convict from 'convict'
import {pipe} from 'fp-ts/lib/pipeable'
import * as array from 'fp-ts/lib/Array'
import * as _ from 'lodash/fp'
import {ClientName, Config, ProcessConfig} from './type'

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
    doc: `Directory (preferably under distPackagesDir), where ${name} build is stored`,
    format: 'existing-directory',
  },
  executableName: {
    default: defaults.executableName,
    arg: `${name}-executable-name`,
    env: `LUNA_${name}_EXECUTABLE_NAME`,
    doc: `Name of executable to run ${name}`,
  },
  dataDir: {
    settingName: {
      default: defaults.dataDir.settingName,
    },
    directoryName: {
      default: defaults.dataDir.directoryName,
      arg: `${name}-data-dir`,
      env: `${name}_DATA_DIR`,
      doc: `Directory name under Luna datadir, where ${name} contents are stored`,
    },
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
  rpcAddress: {
    default: 'http://127.0.0.1:8342/',
    format: 'url',
    arg: 'rpc-address',
    env: 'LUNA_RPC_ADDRESS',
    doc: "Address where is available Wallet Backend's RPC",
  },
  openDevTools: {
    default: false,
    arg: 'open-dev-tools',
    env: 'LUNA_OPEN_DEVTOOLS',
    doc: 'Whether to open developer tools or not',
  },
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
      packageDirectory: path.resolve(defaultDistPackagesDir, 'midnight-node-moth-pupa-v0.8.0'),
      executableName: 'midnight-node',
      dataDir: {
        settingName: 'midnight.datadir',
        directoryName: 'node',
      },
      additionalSettings: {},
    }),
    wallet: clientConfig('wallet', {
      packageDirectory: path.resolve(defaultDistPackagesDir, 'midnight-wallet-moth-pupa-v0.8.0'),
      executableName: 'midnight-wallet',
      dataDir: {
        settingName: 'wallet.datadir',
        directoryName: 'wallet',
      },
      additionalSettings: {
        'midnight.network.rpc.http.cors-allowed-origins': '*', // Make it possible for Luna to access Wallet's RPC
      },
    }),
  },
})

interface ConfigSource {
  name: string
  path: string
}
export const loadConfigs = (sources: ConfigSource[] = []): Config => {
  sources
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

  return pipe(configGetter.getProperties() as Config, (config) => ({
    ...config,
    dataDir: config.dataDir.startsWith('~')
      ? config.dataDir.replace(`~`, os.homedir())
      : config.dataDir,
  }))
}

export const config = loadConfigs([
  {
    name: 'platform-specific configuration',
    path: path.resolve(__dirname, '..', '..', 'platform-config.json5'),
  },
  {name: 'user configuration', path: path.resolve(__dirname, '..', '..', 'config.json5')},
  {name: 'environment variable LUNA_CONFIG_FILE', path: process.env.LUNA_CONFIG_FILE || ''},
])
