import _ from 'lodash/fp'
import {set as mutatingSet} from 'lodash'
// eslint-disable-next-line import/default
import ElectronStore from 'electron-store'
import {gt} from 'semver'
import {StoreSettingsData, defaultSettingsData, migrationsForSettingsData} from '../settings-state'
import {config} from '../config/renderer'
import {StoreTokensData, defaultTokensData, migrationsForTokensData} from '../tokens/tokens-state'
import {DATADIR_VERSION} from '../shared/version'

export type StoreData = StoreSettingsData & StoreTokensData

const defaultData: StoreData = _.mergeAll([defaultSettingsData, defaultTokensData])

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

const migrations = mergeMigrations([migrationsForSettingsData, migrationsForTokensData])

const getMaxVersion = (v1: string, v2: string): string => (gt(v1, v2) ? v1 : v2)

const projectVersion = getMaxVersion('0.14.0-alpha.4', DATADIR_VERSION)

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

export function createPersistentStore(): Store<StoreData> {
  const store = new ElectronStore({
    defaults: defaultData,
    cwd: config.dataDir,
    migrations,
    // See https://github.com/sindresorhus/electron-store/issues/123
    // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
    // @ts-ignore
    projectVersion,
    deserialize: (text: string) => JSON.parse(text),
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
