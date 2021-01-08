import url from 'url'
import React, {PropsWithChildren, useEffect, FunctionComponent, useState} from 'react'
import addons, {makeDecorator, StoryContext, StoryGetter} from '@storybook/addons'
import {createInMemoryStore} from '../common/store/store'
import {_SettingsState, defaultSettingsData} from '../common/store/settings'
import {THEME_SWITCHER_CHANGE, LANGUAGE_CHANGER_PSEUDO_SWITCH} from './shared-constants'

const store = createInMemoryStore(defaultSettingsData)

const storybookStore: {
  isPseudoLanguageUsed: boolean
} = {
  isPseudoLanguageUsed: false,
}

const ThemeSwitcher: FunctionComponent<{}> = ({children}: PropsWithChildren<{}>) => {
  const themeState = _SettingsState.useContainer()
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
  const channel = addons.getChannel()

  const [isPseudoLanguageUsed, _usePseudoLanguage] = useState(storybookStore.isPseudoLanguageUsed)

  const updatePseudoLanguage = (isPseudo: boolean): void => {
    _usePseudoLanguage(isPseudo)
    // eslint-disable-next-line fp/no-mutation
    storybookStore.isPseudoLanguageUsed = isPseudo
  }

  useEffect(() => {
    channel.on(LANGUAGE_CHANGER_PSEUDO_SWITCH, updatePseudoLanguage)
    return () => channel.removeListener(LANGUAGE_CHANGER_PSEUDO_SWITCH, updatePseudoLanguage)
  }, [])

  const currentURL = url.parse(window.location.href, true)
  if (currentURL.query['theme'] === 'light') {
    store.set(['settings', 'theme'], 'light')
  }

  return (
    <_SettingsState.Provider
      key={isPseudoLanguageUsed ? 'on' : 'off'}
      initialState={{store, isPseudoLanguageUsedDefault: isPseudoLanguageUsed}}
    >
      <ThemeSwitcher>{content}</ThemeSwitcher>
    </_SettingsState.Provider>
  )
}

export const withSettings = makeDecorator({
  name: 'withSettings',
  parameterName: 'settings',
  wrapper: WithSettings,
})
