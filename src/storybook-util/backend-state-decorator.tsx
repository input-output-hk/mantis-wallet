import React from 'react'
import {makeDecorator, StoryContext, StoryGetter, StoryWrapper} from '@storybook/addons'
import {BackendState} from '../common/backend-state'
import {makeWeb3Worker} from '../web3'
import {mockWeb3Worker} from '../web3-mock'

const web3 = makeWeb3Worker(mockWeb3Worker)

const WithBackendState: StoryWrapper = (
  storyFn: StoryGetter,
  context: StoryContext,
  {parameters},
): JSX.Element => {
  const content = storyFn(context)
  const initialState = {web3, ...parameters}

  return <BackendState.Provider initialState={initialState}>{content}</BackendState.Provider>
}

export const withBackendState = makeDecorator({
  name: 'withBackendState',
  parameterName: 'withBackendState',
  wrapper: WithBackendState,
})
