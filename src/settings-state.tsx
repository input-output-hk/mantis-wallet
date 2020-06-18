import {useEffect} from 'react'
import {createContainer} from 'unstated-next'
import {usePersistedState} from './common/hook-utils'
import {Store, createInMemoryStore} from './common/store'

export type Theme = 'dark' | 'light'

interface SettingsState {
  theme: Theme
  switchTheme(newTheme: Theme): void
}

export type StoreSettingsData = {
  settings: {
    theme: Theme
  }
}

export const defaultSettingsData: StoreSettingsData = {
  settings: {
    theme: 'dark',
  },
}

function useSettingsState(
  store: Store<StoreSettingsData> = createInMemoryStore(defaultSettingsData),
): SettingsState {
  const [theme, switchTheme] = usePersistedState(store, ['settings', 'theme'])

  useEffect(() => {
    document.body.classList.forEach((className) => {
      if (className.startsWith('theme-')) document.body.classList.remove(className)
    })
    document.body.classList.add(`theme-${theme}`)
  }, [theme])

  return {
    theme,
    switchTheme,
  }
}

export const SettingsState = createContainer(useSettingsState)
