import React from 'react'
import {makeDecorator, StoryContext, StoryGetter, StoryWrapper} from '@storybook/addons'
import {makeWeb3Worker} from '../web3'
import {mockWeb3Worker} from '../web3-mock'
import {BuildJobState} from '../common/build-job-state'

const web3 = makeWeb3Worker(mockWeb3Worker)

const WithBuildJobState: StoryWrapper = (
  storyFn: StoryGetter,
  context: StoryContext,
  {parameters},
): JSX.Element => {
  const content = storyFn(context)
  const initialState = {web3, ...parameters}

  return <BuildJobState.Provider initialState={initialState}>{content}</BuildJobState.Provider>
}

export const withBuildJobState = makeDecorator({
  name: 'withBuildJobState',
  parameterName: 'withBuildJobState',
  wrapper: WithBuildJobState,
})
