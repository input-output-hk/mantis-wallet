import ElectronStore from 'electron-store' // eslint-disable-line import/default
import {config} from '../config/main'
import {Language} from '../shared/i18n'

type StoreData = {
  'settings.language': Language | undefined
}

export const store = new ElectronStore<StoreData>({
  cwd: config.dataDir,
})
