import {TFunctionRenderer, createTFunctionRenderer} from './i18n'
import {SettingsState} from '../settings-state'
import {formatDate} from './formatters'

interface Formatters {
  formatDate: (date: Date) => string
}

export const useFormatters = (): Formatters => {
  const {dateFormat, timeFormat} = SettingsState.useContainer()
  return {
    formatDate: (date: Date) => formatDate(date, dateFormat, timeFormat),
  }
}

interface UseTranslationState {
  i18n: SettingsState['i18n']
  t: TFunctionRenderer
}

export const useTranslation = (): UseTranslationState => {
  const {i18n} = SettingsState.useContainer()

  return {i18n, t: createTFunctionRenderer(i18n)}
}
