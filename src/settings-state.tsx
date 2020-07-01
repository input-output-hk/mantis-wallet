import {useEffect} from 'react'
import {createContainer} from 'unstated-next'
import {usePersistedState} from './common/hook-utils'
import {Store, createInMemoryStore} from './common/store'

export type Theme = 'dark' | 'light'

export const DATE_FORMATS = ['YYYY-MM-DD', 'MM/DD/YYYY', 'DD-MM-YYYY', 'DD/MM/YYYY'] as const
export const TIME_FORMATS = ['24-hour', '12-hour'] as const

export type DateFormat = typeof DATE_FORMATS[number]
export type TimeFormat = typeof TIME_FORMATS[number]

interface SettingsState {
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
}

export type StoreSettingsData = {
  settings: {
    theme: Theme
    areEmptyTransparentAccountsHidden: boolean
    areHiddenBurnsVisible: boolean
    dateFormat: DateFormat
    timeFormat: TimeFormat
  }
}

export const defaultSettingsData: StoreSettingsData = {
  settings: {
    theme: 'dark',
    areEmptyTransparentAccountsHidden: false,
    areHiddenBurnsVisible: false,
    dateFormat: 'MM/DD/YYYY',
    timeFormat: '12-hour',
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
}
