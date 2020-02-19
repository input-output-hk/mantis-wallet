import {useState, useEffect} from 'react'
import {createContainer} from 'unstated-next'

export type Theme = 'dark' | 'light'

interface ThemeState {
  theme: Theme
  switchTheme(newTheme: Theme): void
}

function useThemeState(initialState: Theme = 'dark'): ThemeState {
  const [theme, switchTheme] = useState<Theme>(initialState)

  // needed to refresh state on initialState prop change (storybook)
  useEffect(() => switchTheme(initialState), [initialState])

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
