import _ from 'lodash/fp'
import {StoreWalletData} from './wallet/types'
import {StoreSettingsData} from './settings/types'
import {StoreBackendData} from './backend/types'
import {defaultWalletData} from './wallet/data'
import {defaultSettingsData} from './settings/data'
import {defaultBackendData, migrationsForBackendData} from './backend/data'
import {Store} from './store'

export type StoreData = StoreWalletData & StoreSettingsData & StoreBackendData

export const defaultData: StoreData = _.mergeAll([
  defaultWalletData,
  defaultSettingsData,
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

export const migrations = mergeMigrations([migrationsForBackendData])
