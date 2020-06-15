import url from 'url'
import React, {PropsWithChildren, useEffect} from 'react'
import addons, {makeDecorator, StoryContext, StoryGetter} from '@storybook/addons'
import {ThemeState} from '../theme-state'
import {THEME_SWITCHER_CHANGE} from './shared-constants'
import {createInMemoryStore, defaultSettingsData} from '../common/store'

const store = createInMemoryStore(defaultSettingsData)

const ThemeSwitcher: React.FunctionComponent<{}> = ({children}: PropsWithChildren<{}>) => {
  const themeState = ThemeState.useContainer()
  const channel = addons.getChannel()

  useEffect(() => {
    const changeTheme = themeState.switchTheme
    channel.on(THEME_SWITCHER_CHANGE, changeTheme)
    return () => channel.removeListener(THEME_SWITCHER_CHANGE, changeTheme)
  }, [])

  return <>{children}</>
}

const WithTheme = (storyFn: StoryGetter, context: StoryContext): JSX.Element => {
  const content = storyFn(context)

  const currentURL = url.parse(window.location.href, true)
  if (currentURL.query['theme'] === 'light') {
    store.set(['settings', 'theme'], 'light')
  }

  return (
    <ThemeState.Provider initialState={store}>
      <ThemeSwitcher>{content}</ThemeSwitcher>
    </ThemeState.Provider>
  )
}

export const withTheme = makeDecorator({
  name: 'withTheme',
  parameterName: 'theme',
  wrapper: WithTheme,
})
