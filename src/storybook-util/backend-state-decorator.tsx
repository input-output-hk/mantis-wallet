import React from 'react'
import {makeDecorator, StoryContext, StoryGetter, StoryWrapper} from '@storybook/addons'
import {BackendState} from '../common/backend-state'

const WithBackendState: StoryWrapper = (
  storyFn: StoryGetter,
  context: StoryContext,
): JSX.Element => {
  const content = storyFn(context)
  return <BackendState.Provider>{content}</BackendState.Provider>
}

export const withBackendState = makeDecorator({
  name: 'withBackendState',
  parameterName: 'withBackendState',
  wrapper: WithBackendState,
})
