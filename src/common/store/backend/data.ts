import {Store} from '../store'
import {StoreBackendData} from './types'
import {config} from '../../../config/renderer'

export const defaultBackendData: StoreBackendData = {
  networkName: config.networkName,
}

export const migrationsForBackendData = {
  '0.1.2-mantis-wallet': (store: Store<StoreBackendData>): void => {
    store.set('networkName', config.networkName)
  },
}
