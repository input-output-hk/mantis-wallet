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
