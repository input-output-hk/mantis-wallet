import {useEffect, useState, useMemo} from 'react'
import i18next from 'i18next'
import {createContainer} from 'unstated-next'
import BigNumber from 'bignumber.js'
import filesize from 'filesize'
import {usePersistedState} from './common/hook-utils'
import {Store, createInMemoryStore} from './common/store'
import {Language, DEFAULT_LANGUAGE} from './shared/i18n'
import {updateLanguage} from './common/ipc-util'
import {
  createAndInitI18nForRenderer,
  TFunctionRenderer,
  LANGUAGE_SETTINGS,
  createTFunctionRenderer,
  TErrorRenderer,
} from './common/i18n'
import {formatDate, toDurationString, formatPercentage, abbreviateAmount} from './common/formatters'
import {rendererLog} from './common/logger'
import {makeDesktopNotification} from './common/notify'
import {copyToClipboard} from './common/clipboard'
import {
  DismissFunction,
  DismissableConfig,
  MsgContent,
  NoticeType,
  makeDismissableMessage,
} from './common/dismissable-message'

export type Theme = 'dark' | 'light'

// FIXME PM-2390 => localized date/time format settings
export const DATE_FORMATS = ['YYYY-MM-DD', 'MM/DD/YYYY', 'DD-MM-YYYY', 'DD/MM/YYYY'] as const
export const TIME_FORMATS = ['24-hour', '12-hour'] as const

export type DateFormat = typeof DATE_FORMATS[number]
export type TimeFormat = typeof TIME_FORMATS[number]

const HASHRATE_SUFFIX = ['hash/s', 'kH/s', 'MH/s', 'GH/s', 'TH/s', 'PH/s', 'EH/s', 'ZH/s', 'YH/s']

export interface Formatters {
  formatDate: (date: Date) => string
  toDurationString: (seconds: number) => string

  formatPercentage: (ratio: number | BigNumber) => string
  abbreviateAmount: (bg: BigNumber) => ReturnType<typeof abbreviateAmount>
  formatFileSize: (bytes: number) => string
  formatHashrate: (hashrate: number) => string
}

interface Translation {
  i18n: typeof i18next
  t: TFunctionRenderer
  translateError: (e: Error) => string
}

interface LocalizedUtilities {
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
  // Wallet settings
  areEmptyTransparentAccountsHidden: boolean
  hideEmptyTransparentAccounts(hide: boolean): void
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
    areEmptyTransparentAccountsHidden: boolean
    dateFormat: DateFormat
    timeFormat: TimeFormat
    language: Language
  }
}

export const defaultSettingsData: StoreSettingsData = {
  settings: {
    theme: 'dark',
    areEmptyTransparentAccountsHidden: false,
    dateFormat: 'MM/DD/YYYY',
    timeFormat: '12-hour',
    language: DEFAULT_LANGUAGE,
  },
}

interface SettingsStateParams {
  store: Store<StoreSettingsData>
  isPseudoLanguageUsedDefault?: boolean
}

const DEFAULT_STATE: SettingsStateParams = {
  store: createInMemoryStore(defaultSettingsData),
  isPseudoLanguageUsedDefault: false,
}

function useSettingsState({
  store,
  isPseudoLanguageUsedDefault,
}: SettingsStateParams = DEFAULT_STATE): SettingsState {
  // Theme settings
  const [theme, switchTheme] = usePersistedState(store, ['settings', 'theme'])

  // Wallet settings
  const [areEmptyTransparentAccountsHidden, hideEmptyTransparentAccounts] = usePersistedState(
    store,
    ['settings', 'areEmptyTransparentAccountsHidden'],
  )

  // Locale settings
  const [dateFormat, setDateFormat] = usePersistedState(store, ['settings', 'dateFormat'])
  const [timeFormat, setTimeFormat] = usePersistedState(store, ['settings', 'timeFormat'])
  const [language, _setLanguage] = usePersistedState(store, ['settings', 'language'])
  const [isPseudoLanguageUsed, usePseudoLanguage] = useState(isPseudoLanguageUsedDefault || false)

  useEffect(() => {
    document.documentElement.lang = language // eslint-disable-line fp/no-mutation
  }, [language])

  const translation = useMemo((): Translation => {
    const i18n = createAndInitI18nForRenderer(language, isPseudoLanguageUsed)
    const t = createTFunctionRenderer(i18n)
    return {
      i18n,
      t,
      translateError: (e: Error) => {
        if (e instanceof TErrorRenderer) {
          return t(e.tKey, e.options)
        }

        rendererLog.warn(`Untranslated error: ${e.message}`, e)
        return e.message
      },
    }
  }, [isPseudoLanguageUsed])

  const localizedUtilities = useMemo((): LocalizedUtilities => {
    return {
      makeDesktopNotification: (body: string, title?: string, options: NotificationOptions = {}) =>
        makeDesktopNotification(body, title ?? translation.t(['title', 'lunaWallet']), {
          lang: language,
          ...options,
        }),
      copyToClipboard: (text: string) =>
        copyToClipboard(text, translation.t(['common', 'message', 'copiedToClipboard'])),
      makeDismissableMessage: (
        type: NoticeType,
        Content: MsgContent,
        config: Partial<DismissableConfig> = {},
      ) => makeDismissableMessage(translation.t, type, Content, config),
    }
  }, [isPseudoLanguageUsed])

  const setLanguage = (language: Language): void => {
    _setLanguage(language)
    translation.i18n.changeLanguage(language)
    updateLanguage(language)
  }

  const formatters = useMemo((): Formatters => {
    const {dateFnsLocale, numberFormat, bigNumberFormat} = LANGUAGE_SETTINGS[
      language || DEFAULT_LANGUAGE
    ]

    return {
      formatDate: (date: Date) => formatDate(date, dateFormat, timeFormat, dateFnsLocale),
      toDurationString: (seconds: number) => toDurationString(seconds, dateFnsLocale),

      formatPercentage: (ratio: number | BigNumber) => `${formatPercentage(ratio, numberFormat)}%`,
      abbreviateAmount: (bg: BigNumber) => abbreviateAmount(bg, bigNumberFormat),
      formatFileSize: (bytes: number) => filesize(bytes, {locale: language}),
      formatHashrate: (hashrate: number) =>
        filesize(hashrate, {locale: language, fullform: true, fullforms: HASHRATE_SUFFIX}),
    }
  }, [language, dateFormat, timeFormat])

  useEffect(() => {
    document.body.classList.forEach((className) => {
      if (className.startsWith('theme-')) document.body.classList.remove(className)
    })
    document.body.classList.add(`theme-${theme}`)
  }, [theme])

  return {
    theme,
    switchTheme,
    areEmptyTransparentAccountsHidden,
    hideEmptyTransparentAccounts,
    dateFormat,
    setDateFormat,
    timeFormat,
    setTimeFormat,
    language,
    setLanguage,
    isPseudoLanguageUsed,
    usePseudoLanguage,
    formatters,
    translation,
    localizedUtilities,
  }
}

export const SettingsState = createContainer(useSettingsState)

export const useFormatters = (): Formatters => SettingsState.useContainer().formatters

export const useTranslation = (): Translation => SettingsState.useContainer().translation

export const useLocalizedUtilities = (): LocalizedUtilities =>
  SettingsState.useContainer().localizedUtilities

export const migrationsForSettingsData = {
  '0.14.0-alpha.1': (store: Store<StoreSettingsData>) => {
    store.set('settings', {
      ...store.get('settings'),
      areEmptyTransparentAccountsHidden:
        defaultSettingsData.settings.areEmptyTransparentAccountsHidden,
    })
  },
  '0.14.0-alpha.2': (store: Store<StoreSettingsData>) => {
    store.set('settings', {
      ...store.get('settings'),
      dateFormat: defaultSettingsData.settings.dateFormat,
      timeFormat: defaultSettingsData.settings.timeFormat,
    })
  },
  '0.14.0-alpha.4': (store: Store<StoreSettingsData>) => {
    store.set('settings', {
      ...store.get('settings'),
      language: defaultSettingsData.settings.language,
    })
  },
}
