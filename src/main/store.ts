import ElectronStore from 'electron-store'
import {config} from '../config/main'
import {NetworkName} from '../config/type'
import {Language, DEFAULT_LANGUAGE} from '../shared/i18n'

type StoreData = {
  'settings.language': Language
  'networkName': NetworkName
}

const DEFAULT_DATA: StoreData = {
  'settings.language': DEFAULT_LANGUAGE,
  'networkName': config.networkName,
}

export const store = new ElectronStore<StoreData>({
  cwd: config.dataDir,
  defaults: DEFAULT_DATA,
  watch: true,
})
