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
  // theme settings
  theme: Theme
  switchTheme(newTheme: Theme): void
  // wallet settings
  areEmptyTransparentAccountsHidden: boolean
  hideEmptyTransparentAccounts(hide: boolean): void
  // pob settings
  areHiddenBurnsVisible: boolean
  setHiddenBurnsVisible(visible: boolean): void
  // datetime settings
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
  const [theme, switchTheme] = usePersistedState(store, ['settings', 'theme'])
  const [areEmptyTransparentAccountsHidden, hideEmptyTransparentAccounts] = usePersistedState(
    store,
    ['settings', 'areEmptyTransparentAccountsHidden'],
  )
  const [areHiddenBurnsVisible, setHiddenBurnsVisible] = usePersistedState(store, [
    'settings',
    'areHiddenBurnsVisible',
  ])

  // Datetime settings
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
      areEmptyTransparentAccountsHidden: false,
    })
  },
  '0.14.0-alpha.2': (store: Store<StoreSettingsData>) => {
    store.set('settings', {
      ...store.get('settings'),
      areHiddenBurnsVisible: false,
      dateFormat: 'YYYY-MM-DD',
      timeFormat: '24-hour',
    })
  },
}
