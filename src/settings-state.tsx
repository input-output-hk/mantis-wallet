import {useEffect} from 'react'
import {createContainer} from 'unstated-next'
import {usePersistedState} from './common/hook-utils'
import {Store, createInMemoryStore} from './common/store'

export type Theme = 'dark' | 'light'

interface SettingsState {
  theme: Theme
  switchTheme(newTheme: Theme): void
  areEmptyTransparentAccountsHidden: boolean
  hideEmptyTransparentAccounts(hide: boolean): void
}

export type StoreSettingsData = {
  settings: {
    theme: Theme
    areEmptyTransparentAccountsHidden: boolean
  }
}

export const defaultSettingsData: StoreSettingsData = {
  settings: {
    theme: 'dark',
    areEmptyTransparentAccountsHidden: false,
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
}
