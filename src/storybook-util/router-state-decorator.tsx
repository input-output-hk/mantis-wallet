import React from 'react'
import {makeDecorator, StoryContext, StoryGetter} from '@storybook/addons'
import {RouterState} from '../router-state'

const WithRouterState = (storyFn: StoryGetter, context: StoryContext): JSX.Element => {
  const content = storyFn(context)
  return <RouterState.Provider>{content}</RouterState.Provider>
}

export const withRouterState = makeDecorator({
  name: 'withRouterState',
  parameterName: 'routerState',
  wrapper: WithRouterState,
})
