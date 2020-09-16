import _ from 'lodash/fp'
import {set as mutatingSet} from 'lodash'
// eslint-disable-next-line import/default
import ElectronStore from 'electron-store'
import {StoreWalletData, defaultWalletData} from './wallet-state'
import {StoreSettingsData, defaultSettingsData} from '../settings-state'
import {config} from '../config/renderer'
import {StoreTokensData, defaultTokensData} from '../tokens/tokens-state'

export type StoreData = StoreWalletData & StoreSettingsData & StoreTokensData

const defaultData: StoreData = _.mergeAll([
  defaultWalletData,
  defaultSettingsData,
  defaultTokensData,
])

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
