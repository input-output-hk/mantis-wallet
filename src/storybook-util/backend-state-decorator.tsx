import React from 'react'
import {makeDecorator, StoryContext, StoryGetter, StoryWrapper} from '@storybook/addons'
import {_BackendState} from '../common/store/backend'

const WithBackendState: StoryWrapper = (
  storyFn: StoryGetter,
  context: StoryContext,
): JSX.Element => {
  const content = storyFn(context)
  return <_BackendState.Provider>{content}</_BackendState.Provider>
}

export const withBackendState = makeDecorator({
  name: 'withBackendState',
  parameterName: 'withBackendState',
  wrapper: WithBackendState,
})
