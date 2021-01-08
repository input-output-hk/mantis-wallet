import {BigNumber} from 'bignumber.js'
import i18next from 'i18next'
import {abbreviateAmount} from '../../formatters'
import {TFunctionRenderer} from '../../i18n'
import {NoticeType, MsgContent, DismissableConfig, DismissFunction} from '../../dismissable-message'
import {Language} from '../../../shared/i18n'

export type Theme = 'dark' | 'light'

export const DATE_FORMATS = ['YYYY-MM-DD', 'MM/DD/YYYY', 'DD-MM-YYYY', 'DD/MM/YYYY'] as const
export const TIME_FORMATS = ['24-hour', '12-hour'] as const

export type DateFormat = typeof DATE_FORMATS[number]
export type TimeFormat = typeof TIME_FORMATS[number]

export const HASHRATE_SUFFIX = [
  'hash/s',
  'kH/s',
  'MH/s',
  'GH/s',
  'TH/s',
  'PH/s',
  'EH/s',
  'ZH/s',
  'YH/s',
]

export interface Formatters {
  formatDate: (date: Date) => string
  toDurationString: (seconds: number) => string

  formatPercentage: (ratio: number | BigNumber) => string
  abbreviateAmount: (bg: BigNumber) => ReturnType<typeof abbreviateAmount>
  formatFileSize: (bytes: number) => string
  formatHashrate: (hashrate: number) => string
}

export interface Translation {
  i18n: typeof i18next
  t: TFunctionRenderer
  translateError: (e: Error) => string
}

export interface LocalizedUtilities {
  makeDesktopNotification: (body: string, title?: string, options?: NotificationOptions) => void
  copyToClipboard: (text: string) => Promise<void>
  makeDismissableMessage: (
    type: NoticeType,
    Content: MsgContent,
    config?: Partial<DismissableConfig>,
  ) => DismissFunction
}

export interface SettingsState {
  // Theme settings
  theme: Theme
  switchTheme(newTheme: Theme): void
  // Locale settings
  dateFormat: DateFormat
  setDateFormat(dateFormat: DateFormat): void
  timeFormat: TimeFormat
  setTimeFormat(timeFormat: TimeFormat): void
  language: Language
  setLanguage(language: Language): void
  isPseudoLanguageUsed: boolean
  usePseudoLanguage(on: boolean): void
  // Localized helpers
  formatters: Formatters
  translation: Translation
  localizedUtilities: LocalizedUtilities
}

export type StoreSettingsData = {
  settings: {
    theme: Theme
    dateFormat: DateFormat
    timeFormat: TimeFormat
    language: Language
  }
}
