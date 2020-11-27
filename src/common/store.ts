import _ from 'lodash/fp'
import {set as mutatingSet} from 'lodash'
import ElectronStore from 'electron-store'
import {gt} from 'semver'
import {defaultWalletData, StoreWalletData} from './wallet-state'
import {defaultSettingsData, StoreSettingsData} from '../settings-state'
import {config} from '../config/renderer'
import {defaultTokensData, StoreTokensData} from '../tokens/tokens-state'
import {defaultBackendData, migrationsForBackendData, StoreBackendData} from './backend-state'
import {DATADIR_VERSION} from '../shared/version'

export type StoreData = StoreWalletData & StoreSettingsData & StoreTokensData & StoreBackendData

const defaultData: StoreData = _.mergeAll([
  defaultWalletData,
  defaultSettingsData,
  defaultTokensData,
  defaultBackendData,
])

const mergeMigrations = _.mergeAllWith(
  (
    objValue: undefined | ((store: Store<StoreData>) => void),
    srcValue: (store: Store<StoreData>) => void,
  ) => {
    if (objValue === undefined) {
      return srcValue
    } else {
      return (store: Store<StoreData>): void => {
        objValue.call(undefined, store)
        srcValue.call(undefined, store)
      }
    }
  },
)

const migrations = mergeMigrations([migrationsForBackendData])

export interface Store<TObject extends object> {
  get<K extends keyof TObject>(key: K): TObject[K]
  get<K1 extends keyof TObject, K2 extends keyof TObject[K1]>(key: [K1, K2]): TObject[K1][K2]

  set<K extends keyof TObject>(key: K, value: TObject[K]): void
  set<K1 extends keyof TObject, K2 extends keyof TObject[K1]>(
    key: [K1, K2],
    value: TObject[K1][K2],
  ): void
}

export function createInMemoryStore<TObject extends object>(initial: TObject): Store<TObject> {
  const store = _.cloneDeep(initial)

  function get<K1 extends keyof TObject, K2 extends keyof TObject[K1]>(
    key: K1 | [K1, K2],
  ): TObject[K1] | TObject[K1][K2] {
    return _.get(key)(store)
  }

  function set<K1 extends keyof TObject, K2 extends keyof TObject[K1]>(
    key: K1 | [K1, K2],
    value: TObject[K1] | TObject[K1][K2],
  ): void {
    mutatingSet(store, key, value)
  }

  return {
    get,
    set,
  }
}

const getMaxVersion = (v1: string, v2: string): string => (gt(v1, v2) ? v1 : v2)

const projectVersion = getMaxVersion('0.1.3-mantis-wallet', DATADIR_VERSION)

export function createPersistentStore(): Store<StoreData> {
  const store = new ElectronStore({
    defaults: defaultData,
    cwd: config.dataDir,
    migrations,
    // See https://github.com/sindresorhus/electron-store/issues/123
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    projectVersion,
    deserialize: (text: string) => JSON.parse(text),
    watch: true,
  })

  function get<K1 extends keyof StoreData, K2 extends keyof StoreData[K1]>(
    key: K1 | [K1, K2],
  ): StoreData[K1] | StoreData[K1][K2] {
    if (_.isArray(key)) {
      return _.get([key[1]])(store.get(key[0]))
    } else {
      return store.get(key)
    }
  }

  function set<K1 extends keyof StoreData, K2 extends keyof StoreData[K1]>(
    key: K1 | [K1, K2],
    value: StoreData[K1],
  ): void {
    if (_.isArray(key)) {
      store.set({
        [key[0]]: _.set(key[1], value)(store.get(key[0])),
      })
    } else {
      store.set(key, value)
    }
  }

  return {
    get,
    set,
  }
}
