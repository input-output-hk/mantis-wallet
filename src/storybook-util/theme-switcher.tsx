import React, {PropsWithChildren, useEffect} from 'react'
import addons, {makeDecorator, StoryContext, StoryGetter} from '@storybook/addons'
import {ThemeState, Theme} from '../theme-state'
import {THEME_SWITHER_CHANGE} from './theme-switcher-constants'

const store: {
  theme: Theme
} = {
  theme: 'dark',
}

const ThemeSwitcher: React.FunctionComponent<{}> = ({children}: PropsWithChildren<{}>) => {
  const themeState = ThemeState.useContainer()
  const channel = addons.getChannel()

  useEffect(() => {
    const changeTheme = (theme: Theme): void => {
      // eslint-disable-next-line
      store.theme = theme
      themeState.switchTheme(theme)
    }
    channel.on(THEME_SWITHER_CHANGE, changeTheme)
    return () => channel.removeListener(THEME_SWITHER_CHANGE, changeTheme)
  }, [])

  return <>{children}</>
}

const WithTheme = (storyFn: StoryGetter, context: StoryContext): JSX.Element => {
  const content = storyFn(context)
  return (
    <ThemeState.Provider initialState={store.theme}>
      <ThemeSwitcher>{content}</ThemeSwitcher>
    </ThemeState.Provider>
  )
}

export const withTheme = makeDecorator({
  name: 'withTheme',
  parameterName: 'theme',
  wrapper: WithTheme,
})
