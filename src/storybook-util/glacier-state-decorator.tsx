import React from 'react'
import {makeDecorator, StoryContext, StoryGetter, StoryWrapper} from '@storybook/addons'
import {makeWeb3Worker} from '../web3'
import {mockWeb3Worker} from '../web3-mock'
import {GlacierState} from '../glacier-drop/glacier-state'

const web3 = makeWeb3Worker(mockWeb3Worker)

const WithGlacierState: StoryWrapper = (
  storyFn: StoryGetter,
  context: StoryContext,
  {parameters},
): JSX.Element => {
  const content = storyFn(context)
  const initialState = {web3, ...parameters}

  return <GlacierState.Provider initialState={initialState}>{content}</GlacierState.Provider>
}

export const withGlacierState = makeDecorator({
  name: 'withGlacierState',
  parameterName: 'withGlacierState',
  wrapper: WithGlacierState,
})
