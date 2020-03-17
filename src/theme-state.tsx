import {useEffect} from 'react'
import {createContainer} from 'unstated-next'
import {usePersistedState} from './common/hook-utils'
import {Store, createInMemoryStore, StoreSettingsData, defaultSettingsData} from './common/store'

export type Theme = 'dark' | 'light'

interface ThemeState {
  theme: Theme
  switchTheme(newTheme: Theme): void
}

function useThemeState(
  store: Store<StoreSettingsData> = createInMemoryStore(defaultSettingsData),
): ThemeState {
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

export const ThemeState = createContainer(useThemeState)
