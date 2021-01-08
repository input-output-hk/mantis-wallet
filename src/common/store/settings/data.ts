import {DEFAULT_LANGUAGE} from '../../../shared/i18n'
import {StoreSettingsData} from './types'

export const defaultSettingsData: StoreSettingsData = {
  settings: {
    theme: 'dark',
    dateFormat: 'MM/DD/YYYY',
    timeFormat: '12-hour',
    language: DEFAULT_LANGUAGE,
  },
}
