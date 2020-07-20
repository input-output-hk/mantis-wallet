import url from 'url'
import React, {PropsWithChildren, useEffect, FunctionComponent} from 'react'
import addons, {makeDecorator, StoryContext, StoryGetter} from '@storybook/addons'
import {createInMemoryStore} from '../common/store'
import {SettingsState, defaultSettingsData} from '../settings-state'
import {THEME_SWITCHER_CHANGE} from './shared-constants'

const store = createInMemoryStore(defaultSettingsData)

const ThemeSwitcher: FunctionComponent<{}> = ({children}: PropsWithChildren<{}>) => {
  const themeState = SettingsState.useContainer()
  const channel = addons.getChannel()

  useEffect(() => {
    const changeTheme = themeState.switchTheme
    channel.on(THEME_SWITCHER_CHANGE, changeTheme)
    return () => channel.removeListener(THEME_SWITCHER_CHANGE, changeTheme)
  }, [])

  return <>{children}</>
}

const WithSettings = (storyFn: StoryGetter, context: StoryContext): JSX.Element => {
  const content = storyFn(context)

  const currentURL = url.parse(window.location.href, true)
  if (currentURL.query['theme'] === 'light') {
    store.set(['settings', 'theme'], 'light')
  }

  return (
    <SettingsState.Provider initialState={store}>
      <ThemeSwitcher>{content}</ThemeSwitcher>
    </SettingsState.Provider>
  )
}

export const withSettings = makeDecorator({
  name: 'withSettings',
  parameterName: 'settings',
  wrapper: WithSettings,
})
