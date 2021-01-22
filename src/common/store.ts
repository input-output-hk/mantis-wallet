import _ from 'lodash/fp'
import {Observable} from 'rxjs'
import {set as mutatingSet} from 'lodash'
import ElectronStore from 'electron-store'
import {gt} from 'semver'
import {config} from '../config/renderer'
import {DATADIR_VERSION} from '../shared/version'

type OnDidChangeData<T> = {oldVal: T; newVal: T}

export interface Store<TObject extends object> {
  get<K extends keyof TObject>(key: K): TObject[K]
  get<K1 extends keyof TObject, K2 extends keyof TObject[K1]>(key: [K1, K2]): TObject[K1][K2]
  get<K1 extends keyof TObject, K2 extends keyof TObject[K1], K3 extends keyof TObject[K1][K2]>(
    key: [K1, K2, K3],
  ): TObject[K1][K2][K3]

  set<K extends keyof TObject>(key: K, value: TObject[K]): void
  set<K1 extends keyof TObject, K2 extends keyof TObject[K1]>(
    key: [K1, K2],
    value: TObject[K1][K2],
  ): void

  set<K1 extends keyof TObject, K2 extends keyof TObject[K1], K3 extends keyof TObject[K1][K2]>(
    key: [K1, K2, K3],
    value: TObject[K1][K2][K3],
  ): void

  onDidChange?<K extends keyof TObject>(key: K): Observable<OnDidChangeData<TObject[K]>>
  onDidChange?<K1 extends keyof TObject, K2 extends keyof TObject[K1]>(
    key: [K1, K2],
  ): Observable<OnDidChangeData<TObject[K1][K2]>>
}

export function createInMemoryStore<TObject extends object>(initial: TObject): Store<TObject> {
  const store = _.cloneDeep(initial)

  function get<
    K1 extends keyof TObject,
    K2 extends keyof TObject[K1],
    K3 extends keyof TObject[K1][K2]
  >(key: K1 | [K1, K2] | [K1, K2, K3]): TObject[K1] | TObject[K1][K2] | TObject[K1][K2][K3] {
    return _.get(key)(store)
  }

  function set<
    K1 extends keyof TObject,
    K2 extends keyof TObject[K1],
    K3 extends keyof TObject[K1][K2]
  >(
    key: K1 | [K1, K2] | [K1, K2, K3],
    value: TObject[K1] | TObject[K1][K2] | TObject[K1][K2][K3],
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

export function createPersistentStore<T extends object>(
  options?: ElectronStore.Options<T>,
): Store<T> {
  const store = new ElectronStore({
    cwd: config.walletDataDir,
    // See https://github.com/sindresorhus/electron-store/issues/123
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    projectVersion,
    deserialize: (text: string) => JSON.parse(text),
    watch: true,
    ...options,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  }) as ElectronStore<any>

  function get<K1 extends keyof T, K2 extends keyof T[K1], K3 extends keyof T[K1][K2]>(
    key: K1 | [K1, K2] | [K1, K2, K3],
  ): T[K1] | T[K1][K2] | T[K1][K2][K3] {
    if (_.isArray(key)) {
      return store.get(key.join('.'))
    } else {
      return store.get(key)
    }
  }

  function set<K1 extends keyof T, K2 extends keyof T[K1], K3 extends keyof T[K1][K2]>(
    key: K1 | [K1, K2] | [K1, K2, K3],
    value: T[K1] | T[K1][K2] | T[K1][K2][K3],
  ): void {
    const path = _.isArray(key) ? key.join('.') : key
    if (value === undefined) {
      store.delete(path)
    } else {
      store.set(path, value)
    }
  }

  function onDidChange<K1 extends keyof T, K2 extends keyof T[K1]>(
    key: K1 | [K1, K2],
  ): Observable<OnDidChangeData<T[K1]> | OnDidChangeData<T[K1][K2]>> {
    const strPath = _.isArray(key) ? key.join('.') : key
    return new Observable((subscriber) => {
      const unsubscribe = store.onDidChange(strPath, (newVal, oldVal) => {
        subscriber.next({oldVal, newVal})
      })

      return unsubscribe
    })
  }

  return {
    get,
    set,
    onDidChange,
  }
}
