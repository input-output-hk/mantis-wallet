// Convict formats require throwing errors to validate values
import path from 'path'
import fs from 'fs'
import {homedir} from 'os'
import convict, {Format} from 'convict'
import {pipe} from 'fp-ts/lib/pipeable'
import * as array from 'fp-ts/lib/Array'
import * as either from 'fp-ts/lib/Either'
import * as _ from 'lodash/fp'
import {option} from 'fp-ts'
import {Option} from 'fp-ts/lib/Option'
import {Type} from 'io-ts'
import {Config, NetworkName, MantisConfig} from './type'
import {tildeToHome} from '../main/pathUtils'
import {mapProp, optionZip, through} from '../shared/utils'
import {TLSConfig} from '../main/tls'

const formatFromIoTS = <A, O = A>(theType: Type<A, O, unknown>): Format => {
  const coerce = (val: unknown): A => {
    return pipe(
      val,
      theType.decode,
      either.fold(
        (errors) => {
          const errorsStringified = errors
            .map((err) => err.message)
            .filter(Boolean)
            .join(', ')
          throw Error(`Couldn't parse ${val} into ${theType.name} due to ${errorsStringified}`)
        },
        (result) => result,
      ),
    )
  }
  return {
    coerce,
    validate(val: unknown): void {
      coerce(val)
    },
  }
}

convict.addFormats({
  'existing-directory': {
    validate(val: unknown): void {
      if (typeof val != 'string') {
        throw Error('Expected a string containing path to existing directory')
      }

      if (!fs.statSync(val).isDirectory()) {
        throw Error(`Expected ${val} to be a path of an existing directory`)
      }
    },
  },
  'network-name': formatFromIoTS(NetworkName),
  'settings-map': {
    validate(val: unknown): void {
      if (!(val instanceof Map) && !(val instanceof Object)) {
        throw Error(`Expected ${JSON.stringify(val)} to be a Map/Object`)
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
        throw Error(`Couldn't parse ${JSON.stringify(val)} to settings map`)
      }
    },
  },
  'own-url': (() => {
    const coerce = (val: unknown): URL => {
      if (typeof val === 'string') {
        return new URL(val)
      } else {
        throw Error(`Expected string containg valid URL, got ${val} instead`)
      }
    }

    return {
      coerce,
      validate(val: unknown): void {
        coerce(val)
      },
    }
  })(),
})

const defaultDataDir = path.resolve(homedir(), '.mantis-wallet')
const defaultDistPackagesDir = path.resolve(__dirname, '..', '..', '..', 'mantis-dist')

const mantisConfig = (defaults: MantisConfig): convict.Schema<MantisConfig> => ({
  packageDirectory: {
    default: defaults.packageDirectory,
    arg: `mantis-package-directory`,
    env: `MANTIS_PACKAGE_DIRECTORY`,
    doc: `Directory (preferably under distPackagesDir), where Mantis build is stored`,
    format: 'existing-directory',
  },
  executableName: {
    default: defaults.executableName,
    arg: `mantis-executable-name`,
    env: `MANTIS_EXECUTABLE_NAME`,
    doc: `Name of executable to run mantis`,
  },
  dataDirName: {
    default: defaults.dataDirName,
    arg: `mantis-data-dir`,
    env: `MANTIS_DATA_DIR`,
    doc: `Directory name under Luna datadir, where mantis contents are stored`,
  },
  additionalSettings: {
    default: defaults.additionalSettings,
    arg: `mantis-additional-settings`,
    env: `MANTIS_ADDITIONAL_SETTINGS`,
    doc: `Additional settings for running mantis`,
    format: 'settings-map',
  },
})

const configGetter = convict({
  networkName: {
    default: 'testnet-internal',
    format: 'network-name',
    arg: 'network',
    env: 'LUNA_NETWORK',
    doc: 'Which network Luna should connect to',
  },
  rpcAddress: {
    default: 'https://127.0.0.1:8546/',
    format: 'own-url',
    arg: 'rpc-address',
    env: 'LUNA_RPC_ADDRESS',
    doc: "Address where is available Mantis's RPC",
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
  runNode: {
    default: true,
    arg: 'run-node',
    env: 'LUNA_RUN_NODE',
    doc: 'Whether to run node on its own or not',
  },
  mantis: mantisConfig({
    packageDirectory: path.resolve(defaultDistPackagesDir, 'mantis'),
    executableName: 'mantis',
    dataDirName: 'mantis',
    additionalSettings: {
      'mantis.network.rpc.http.cors-allowed-origins': '*',
    },
  }),
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
        // The path to log files is (might be) unknown at this moment, using logger is skipped
        // eslint-disable-next-line no-console
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
    (config) => ({...config, rpcAddress: new URL(config.rpcAddress)} as Config),
    mapProp('dataDir', tildeToHome),
  )
}

export const config = loadConfigs([
  {
    name: 'configuration file from home directory',
    path: path.resolve(homedir(), 'luna-config.json5'),
  },
  {
    name: 'platform-specific configuration',
    path: path.resolve(__dirname, '..', '..', 'config-platform.json5'),
  },
  {name: 'user configuration', path: path.resolve(__dirname, '..', '..', 'config.json5')},
  {name: 'environment variable LUNA_CONFIG_FILE', path: process.env.LUNA_CONFIG_FILE || ''},
])
