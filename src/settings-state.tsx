import {useEffect, useState, useMemo} from 'react'
import i18next from 'i18next'
import {createContainer} from 'unstated-next'
import {usePersistedState} from './common/hook-utils'
import {Store, createInMemoryStore} from './common/store'
import {Language, DEFAULT_LANGUAGE} from './shared/i18n'
import {createAndInitI18nForRenderer} from './common/i18n'

export type Theme = 'dark' | 'light'

export const DATE_FORMATS = ['YYYY-MM-DD', 'MM/DD/YYYY', 'DD-MM-YYYY', 'DD/MM/YYYY'] as const
export const TIME_FORMATS = ['24-hour', '12-hour'] as const

export type DateFormat = typeof DATE_FORMATS[number]
export type TimeFormat = typeof TIME_FORMATS[number]

export interface SettingsState {
  // Theme settings
  theme: Theme
  switchTheme(newTheme: Theme): void
  // Wallet settings
  areEmptyTransparentAccountsHidden: boolean
  hideEmptyTransparentAccounts(hide: boolean): void
  // PoB settings
  areHiddenBurnsVisible: boolean
  setHiddenBurnsVisible(visible: boolean): void
  // Locale settings
  dateFormat: DateFormat
  setDateFormat(dateFormat: DateFormat): void
  timeFormat: TimeFormat
  setTimeFormat(timeFormat: TimeFormat): void
  language: Language
  setLanguage(language: Language): void
  isPseudoLanguageUsed: boolean
  usePseudoLanguage(on: boolean): void
  i18n: typeof i18next
}

export type StoreSettingsData = {
  settings: {
    theme: Theme
    areEmptyTransparentAccountsHidden: boolean
    areHiddenBurnsVisible: boolean
    dateFormat: DateFormat
    timeFormat: TimeFormat
    language: Language
  }
}

export const defaultSettingsData: StoreSettingsData = {
  settings: {
    theme: 'dark',
    areEmptyTransparentAccountsHidden: false,
    areHiddenBurnsVisible: false,
    dateFormat: 'MM/DD/YYYY',
    timeFormat: '12-hour',
    language: DEFAULT_LANGUAGE,
  },
}

function useSettingsState(
  store: Store<StoreSettingsData> = createInMemoryStore(defaultSettingsData),
): SettingsState {
  // Theme settings
  const [theme, switchTheme] = usePersistedState(store, ['settings', 'theme'])

  // Wallet settings
  const [areEmptyTransparentAccountsHidden, hideEmptyTransparentAccounts] = usePersistedState(
    store,
    ['settings', 'areEmptyTransparentAccountsHidden'],
  )

  // PoB settings
  const [areHiddenBurnsVisible, setHiddenBurnsVisible] = usePersistedState(store, [
    'settings',
    'areHiddenBurnsVisible',
  ])

  // Locale settings
  const [dateFormat, setDateFormat] = usePersistedState(store, ['settings', 'dateFormat'])
  const [timeFormat, setTimeFormat] = usePersistedState(store, ['settings', 'timeFormat'])
  const [language, _setLanguage] = usePersistedState(store, ['settings', 'language'])
  const [isPseudoLanguageUsed, usePseudoLanguage] = useState(false)
  const i18n = useMemo(() => createAndInitI18nForRenderer(language, isPseudoLanguageUsed), [
    isPseudoLanguageUsed,
  ])

  const setLanguage = (language: Language): void => {
    _setLanguage(language)
    i18n.changeLanguage(language)
  }

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
    areHiddenBurnsVisible,
    setHiddenBurnsVisible,
    dateFormat,
    setDateFormat,
    timeFormat,
    setTimeFormat,
    language,
    setLanguage,
    isPseudoLanguageUsed,
    usePseudoLanguage,
    i18n,
  }
}

export const SettingsState = createContainer(useSettingsState)

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
      areHiddenBurnsVisible: defaultSettingsData.settings.areHiddenBurnsVisible,
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
