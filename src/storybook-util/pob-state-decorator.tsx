import React from 'react'
import {makeDecorator, StoryContext, StoryGetter} from '@storybook/addons'
import {ProofOfBurnState} from '../pob/pob-state'

const WithPobState = (storyFn: StoryGetter, context: StoryContext): JSX.Element => {
  const content = storyFn(context)
  return <ProofOfBurnState.Provider>{content}</ProofOfBurnState.Provider>
}

export const withPobState = makeDecorator({
  name: 'withPobState',
  parameterName: 'pobState',
  wrapper: WithPobState,
})
