import ElectronStore from 'electron-store'
import {config} from '../config/main'
import {NetworkName} from '../config/type'
import {Language, DEFAULT_LANGUAGE} from '../shared/i18n'
import {DatadirChecked} from './compatibility-check'

type StoreData = {
  'settings.language': Language
  'networkName': NetworkName
}

const DEFAULT_DATA: StoreData = {
  'settings.language': DEFAULT_LANGUAGE,
  'networkName': config.networkName,
}

export type MainStore = ElectronStore<StoreData>

export const createStore = (_datadirChecked: DatadirChecked): MainStore =>
  new ElectronStore<StoreData>({
    cwd: config.dataDir,
    defaults: DEFAULT_DATA,
    watch: true,
  })
