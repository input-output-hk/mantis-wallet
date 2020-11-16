import ElectronStore from 'electron-store'
import {config} from '../config/main' // FIXME
import {NetworkName} from '../config/type'
import {Language, DEFAULT_LANGUAGE} from '../shared/i18n'
import {CheckedDatadir} from './data-dir'

type StoreData = {
  'settings.language': Language
  'networkName': NetworkName
}

const DEFAULT_DATA: StoreData = {
  'settings.language': DEFAULT_LANGUAGE,
  'networkName': config.networkName,
}

export type MainStore = ElectronStore<StoreData>

export const createStore = (checkedDatadir: CheckedDatadir): MainStore =>
  new ElectronStore<StoreData>({
    cwd: checkedDatadir.datadirPath,
    defaults: DEFAULT_DATA,
    watch: true,
  })
