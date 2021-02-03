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
import {
  formatDate,
  toDurationString,
  formatPercentage,
  abbreviateAmount,
  DateFormat,
  TimeFormat,
} from './common/formatters'
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
  // Locale settings
  dateFormat: DateFormat
  setDateFormat(dateFormat: DateFormat): void
  timeFormat: TimeFormat
  setTimeFormat(timeFormat: TimeFormat): void
  language: Language
  setLanguage(language: Language): void
  isPseudoLanguageUsed: boolean
  usePseudoLanguage(on: boolean): void
  // Mantis Node settings
  mantisDatadir: string
  setMantisDatadir(mantisDatadir: string): void
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
    mantisDatadir: string
  }
}

export const defaultSettingsData: StoreSettingsData = {
  settings: {
    theme: 'dark',
    dateFormat: 'MM/DD/YYYY',
    timeFormat: '12-hour',
    language: DEFAULT_LANGUAGE,
    mantisDatadir: '',
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

  // Locale settings
  const [dateFormat, setDateFormat] = usePersistedState(store, ['settings', 'dateFormat'])
  const [timeFormat, setTimeFormat] = usePersistedState(store, ['settings', 'timeFormat'])
  const [language, _setLanguage] = usePersistedState(store, ['settings', 'language'])
  const [mantisDatadir, setMantisDatadir] = usePersistedState(store, ['settings', 'mantisDatadir'])
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
        makeDesktopNotification(body, title ?? translation.t(['title', 'mantisWallet']), {
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
    dateFormat,
    setDateFormat,
    timeFormat,
    setTimeFormat,
    language,
    setLanguage,
    isPseudoLanguageUsed,
    usePseudoLanguage,
    mantisDatadir,
    setMantisDatadir,
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
