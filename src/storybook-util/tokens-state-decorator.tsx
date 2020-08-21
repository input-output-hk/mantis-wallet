import React from 'react'
import {makeDecorator, StoryContext, StoryGetter} from '@storybook/addons'
import {TokensState} from '../tokens/tokens-state'

const WithTokensState = (storyFn: StoryGetter, context: StoryContext): JSX.Element => {
  const content = storyFn(context)
  return <TokensState.Provider>{content}</TokensState.Provider>
}

export const withTokensState = makeDecorator({
  name: 'withTokensState',
  parameterName: 'tokensState',
  wrapper: WithTokensState,
})
