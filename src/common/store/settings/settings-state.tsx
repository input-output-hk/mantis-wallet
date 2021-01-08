import {useEffect, useState, useMemo} from 'react'
import {createContainer} from 'unstated-next'
import BigNumber from 'bignumber.js'
import filesize from 'filesize'
import {usePersistedState} from '../../hook-utils'
import {Store, createInMemoryStore} from '../store'
import {Language, DEFAULT_LANGUAGE} from '../../../shared/i18n'
import {updateLanguage} from '../../ipc-util'
import {
  createAndInitI18nForRenderer,
  LANGUAGE_SETTINGS,
  createTFunctionRenderer,
  TErrorRenderer,
} from '../../i18n'
import {formatDate, toDurationString, formatPercentage, abbreviateAmount} from '../../formatters'
import {rendererLog} from '../../logger'
import {makeDesktopNotification} from '../../notify'
import {copyToClipboard} from '../../clipboard'
import {defaultSettingsData} from './data'
import {
  StoreSettingsData,
  Formatters,
  HASHRATE_SUFFIX,
  LocalizedUtilities,
  Translation,
  SettingsState,
} from './types'
import {
  NoticeType,
  MsgContent,
  DismissableConfig,
  makeDismissableMessage,
} from '../../dismissable-message'

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
    formatters,
    translation,
    localizedUtilities,
  }
}

export const _SettingsState = createContainer(useSettingsState)

export const useFormatters = (): Formatters => _SettingsState.useContainer().formatters

export const useTranslation = (): Translation => _SettingsState.useContainer().translation

export const useLocalizedUtilities = (): LocalizedUtilities =>
  _SettingsState.useContainer().localizedUtilities
