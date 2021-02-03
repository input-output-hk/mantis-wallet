import ElectronStore from 'electron-store'
import {NetworkName} from '../config/type'
import {Language, DEFAULT_LANGUAGE} from '../shared/i18n'
import {emitToRenderer} from './util'

type StoreData = {
  'settings.language': Language
  'settings.mantisDatadir': string
  'networkName': NetworkName
}

export type MainStore = ElectronStore<StoreData>

export const createStore = (
  walletDatadirPath: string,
  mantisDatadirPath: string | null,
  networkName: NetworkName,
): MainStore => {
  const DEFAULT_DATA: StoreData = {
    'settings.language': DEFAULT_LANGUAGE,
    'settings.mantisDatadir': mantisDatadirPath ?? '',
    'networkName': networkName,
  }

  const store = new ElectronStore<StoreData>({
    cwd: walletDatadirPath,
    defaults: DEFAULT_DATA,
    watch: true,
  })

  store.onDidAnyChange(() => {
    emitToRenderer('store-changed')
  })

  return store
}
