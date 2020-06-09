import React from 'react'
import {makeDecorator, StoryContext, StoryGetter, StoryWrapper} from '@storybook/addons'
import {MiningState} from '../common/mining-state'
import {makeWeb3Worker} from '../web3'
import {mockWeb3Worker} from '../web3-mock'

const web3 = makeWeb3Worker(mockWeb3Worker)

const WithMiningState: StoryWrapper = (
  storyFn: StoryGetter,
  context: StoryContext,
  {parameters},
): JSX.Element => {
  const content = storyFn(context)
  const initialState = {web3, ...parameters}

  return <MiningState.Provider initialState={initialState}>{content}</MiningState.Provider>
}

export const withMiningState = makeDecorator({
  name: 'withMiningState',
  parameterName: 'withMiningState',
  wrapper: WithMiningState,
})
