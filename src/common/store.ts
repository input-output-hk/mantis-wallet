import _ from 'lodash'
import ElectronStore from 'electron-store'
import {Theme} from '../theme-state'
import {config} from '../config/renderer'

export type StoreSettingsData = {
  settings: {
    theme: Theme
  }
}

export const defaultSettingsData: StoreSettingsData = {
  settings: {
    theme: 'dark',
  },
}

export type StoreData = StoreSettingsData

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
    return _.get(store, key)
  }

  function set<K1 extends keyof TObject, K2 extends keyof TObject[K1]>(
    key: K1 | [K1, K2],
    value: TObject[K1] | TObject[K1][K2],
  ): void {
    _.set(store, key, value)
  }

  return {
    get,
    set,
  }
}

export function createPersistentStore(): Store<StoreData> {
  const store = new ElectronStore({
    defaults: defaultSettingsData,
    cwd: config.dataDir,
  })

  function get<K1 extends keyof StoreData, K2 extends keyof StoreData[K1]>(
    key: K1 | [K1, K2],
  ): StoreData[K1] | StoreData[K1][K2] {
    if (_.isArray(key)) {
      return _.get(store.get(key[0]), [key[1]])
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
        [key[0]]: _.set(store.get(key[0]), key[1], value),
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
