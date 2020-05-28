// Convict formats require throwing errors to validate values
import path from 'path'
import fs from 'fs'
import {homedir} from 'os'
import convict from 'convict'
import {pipe} from 'fp-ts/lib/pipeable'
import * as array from 'fp-ts/lib/Array'
import * as _ from 'lodash/fp'
import {option} from 'fp-ts'
import {Option} from 'fp-ts/lib/Option'
import {DEFAULT_CONTRACT_ADDRESSES} from '../shared/config'
import {
  ClientName,
  Config,
  ProcessConfig,
  ProverConfig,
  ContractConfigItem,
  LunaManagedConfig,
} from './type'
import {tildeToHome} from '../main/pathUtils'
import {mapProp, optionZip, through} from '../shared/utils'
import {TLSConfig} from '../main/tls'

const proverConfig: convict.Schema<ProverConfig> = {
  name: {
    default: '',
    doc: 'Name of the prover',
    format: String,
  },
  address: {
    default: '',
    doc: 'Address of the prover',
    format: 'url',
  },
}

const contractConfigItemSchema: convict.Schema<ContractConfigItem> = {
  networkName: {
    doc: 'Name of the network',
    format: String,
    default: '',
  },
  glacierDrop: {
    doc: 'Glacier Drop contract address',
    format: 'bech32',
    default: '',
  },
  constantsRepo: {
    doc: 'Constants Repository contract address',
    format: 'bech32',
    default: '',
  },
}

convict.addFormats({
  'existing-directory': {
    validate(val: unknown): void {
      if (typeof val != 'string') {
        throw new Error('Expected a string containing path to existing directory')
      }

      if (!fs.statSync(val).isDirectory()) {
        throw new Error(`Expected ${val} to be a path of an existing directory`)
      }
    },
  },
  'settings-map': {
    validate(val: unknown): void {
      if (!(val instanceof Map) && !(val instanceof Object)) {
        throw new Error(`Expected ${JSON.stringify(val)} to be a Map/Object`)
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
  ['list-of-provers']: {
    validate(val: unknown): void {
      if (!_.isArray(val)) {
        throw new Error('Must be of type Array')
      }

      val.forEach((possibleProver) => {
        convict(proverConfig)
          .load(possibleProver)
          .validate()
        if (!possibleProver.address) {
          throw new Error("Address shouldn't be empty for prover")
        }
        if (!possibleProver.name) {
          throw new Error("Name shouldn't be empty for prover")
        }
      })
    },
  },
  'contract-config': {
    validate(contractConfigs: unknown) {
      if (!_.isArray(contractConfigs)) {
        throw Error('Must be Array')
      }

      const networkNames = new Set()

      contractConfigs.forEach((item) => {
        convict(contractConfigItemSchema)
          .load(item)
          .validate()

        if (networkNames.has(item.networkName)) {
          throw Error(`Contract config contains ${item.networkName} more than once.`)
        }

        networkNames.add(item.networkName)
      })
    },
  },
})

const defaultDataDir = path.resolve(homedir(), '.luna')
const defaultDistPackagesDir = path.resolve(__dirname, '..', '..', '..', 'midnight-dist')
// const midnightVersion = 'v0.11.0'

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
    default: 'https://127.0.0.1:8342/',
    format: 'url',
    arg: 'rpc-address',
    env: 'LUNA_RPC_ADDRESS',
    doc: "Address where is available Wallet Backend's RPC",
  },
  provers: {
    default: [
      {
        name: 'Testnet',
        address: 'http://pob-prover-1.testnet-pupa.project42.iohkdev.io',
      },
      {
        name: 'VacuumLabs',
        address: 'http://ec2-63-33-28-52.eu-west-1.compute.amazonaws.com',
      },
    ],
    format: 'list-of-provers',
    arg: 'provers',
    env: 'LUNA_PROVERS',
    doc: 'A list of provers.',
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
  tls: {
    keyStorePath: {
      default: '',
      arg: 'tls-key-store-path',
      env: 'LUNA_TLS_KEY_STORE_PATH',
      doc: 'Path to keystore file in PKCS#12 format to be used to validate certificates',
    },
    passwordPath: {
      default: '',
      arg: 'tls-password-path',
      env: 'LUNA_TLS_PASSWORD_PATH',
      doc: 'Path to password file, needed to decrypt keys in keystore',
    },
  },
  runClients: {
    default: true,
    arg: 'run-clients',
    env: 'LUNA_RUN_CLIENTS',
    doc: 'Whether to run wallet backend and Midnight node on its own or not',
  },
  distPackagesDir: {
    default: defaultDistPackagesDir,
    arg: 'dist-packages-dir',
    env: 'LUNA_DIST_PACKAGES_DIR',
    doc: 'Directory, which contains distribution packages of node and wallet',
    format: 'existing-directory',
  },
  clientConfigs: {
    node: clientConfig('node', {
      // packageDirectory: path.resolve(
      //   defaultDistPackagesDir,
      //   `midnight-node-moth-pupa-${midnightVersion}`,
      // ),
      packageDirectory: path.resolve(defaultDistPackagesDir, 'midnight-node'),
      executableName: 'midnight-node',
      dataDir: {
        settingName: 'midnight.datadir',
        directoryName: 'node',
      },
      additionalSettings: {
        'akka.loglevel': 'INFO',
      },
    }),
    wallet: clientConfig('wallet', {
      // packageDirectory: path.resolve(
      //   defaultDistPackagesDir,
      //   `midnight-wallet-moth-pupa-${midnightVersion}`,
      // ),
      packageDirectory: path.resolve(defaultDistPackagesDir, 'midnight-wallet'),
      executableName: 'midnight-wallet',
      dataDir: {
        settingName: 'wallet.datadir',
        directoryName: 'wallet',
      },
      additionalSettings: {
        // FIXME: https://github.com/mozilla/node-convict/issues/250
        'midnight.network.rpc.http.cors-allowed-origins': '*', // Make it possible for Luna to access Wallet's RPC
        'akka.loglevel': 'INFO',
      },
    }),
  },
  contractConfig: {
    doc: 'A collection of contract address configs',
    format: 'contract-config',
    default: [DEFAULT_CONTRACT_ADDRESSES],
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
        console.info(
          `Tried to load ${configSource.name}, (resolved to: ${configSource.path}) but it doesn't exist. Skipping`,
        )
      } else {
        configGetter.loadFile(configSource.path)
      }
    })

  // FIXME: https://github.com/mozilla/node-convict/issues/250
  // configGetter.validate()

  return pipe(
    configGetter.getProperties(),
    mapProp('tls', ({keyStorePath, passwordPath}) => {
      const handlePath: (path: string) => Option<string> = through(
        option.fromNullable,
        option.filter((p) => !_.isEmpty(p)),
        option.map(tildeToHome),
      )
      return pipe(
        optionZip(handlePath(keyStorePath), handlePath(passwordPath)),
        option.map(([keyStorePath, passwordPath]): TLSConfig => ({keyStorePath, passwordPath})),
      )
    }),
    (config) => config as Config,
    mapProp('dataDir', tildeToHome),
  )
}

export const config = loadConfigs([
  {
    name: 'platform-specific configuration',
    path: path.resolve(__dirname, '..', '..', 'config-platform.json5'),
  },
  {name: 'user configuration', path: path.resolve(__dirname, '..', '..', 'config.json5')},
  {
    name: 'contract address config',
    path: path.resolve(__dirname, '..', '..', 'config-contract.json5'),
  },
  {name: 'environment variable LUNA_CONFIG_FILE', path: process.env.LUNA_CONFIG_FILE || ''},
])

// Luna managed config

const lunaManagedConfigSchema = {
  selectedNetwork: {
    doc: 'Name of the network to which Luna is connected',
    format: String,
    default: 'testnet',
  },
  miningEnabled: {
    doc: 'Whether mining is enabled or not',
    format: Boolean,
    default: false,
  },
  pkd: {
    format: String,
    default: '',
  },
  diversifier: {
    format: String,
    default: '',
  },
  ovk: {
    format: String,
    default: '',
  },
}

export const lunaManagedConfigPath = path.resolve(config.dataDir, 'config-luna-managed.json')

export const loadLunaManagedConfig = (): LunaManagedConfig => {
  const lunaManagedConfigGetter = convict(lunaManagedConfigSchema)
  if (fs.existsSync(lunaManagedConfigPath)) {
    lunaManagedConfigGetter.loadFile(lunaManagedConfigPath)
  }
  lunaManagedConfigGetter.validate()
  return lunaManagedConfigGetter.getProperties()
}
