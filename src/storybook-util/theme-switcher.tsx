import React from 'react'
import {makeDecorator, StoryContext, StoryGetter} from '@storybook/addons'
import {select} from '@storybook/addon-knobs'
import {ThemeState} from '../theme-state'

const WithTheme = (storyFn: StoryGetter, context: StoryContext): JSX.Element => {
  const content = storyFn(context)
  const theme = select('Theme', ['light', 'dark'], 'dark')
  return <ThemeState.Provider initialState={theme}>{content}</ThemeState.Provider>
}

export const withTheme = makeDecorator({
  name: 'withTheme',
  parameterName: 'theme',
  wrapper: WithTheme,
})
