import React from 'react'
import {StoryGetter, StoryContext} from '@storybook/addons'
import {number} from '@storybook/addon-knobs'
import {OverviewGraph} from './OverviewGraph'
import {ESSENTIAL_DECORATORS} from '../storybook-util/essential-decorators'

const graphDecorator = (storyFn: StoryGetter, context: StoryContext): JSX.Element => (
  <div style={{width: '400px'}}>{storyFn(context)}</div>
)

export default {
  title: 'Overview Graph',
  decorators: [...ESSENTIAL_DECORATORS, graphDecorator],
}

export const withZeroBalance = (): JSX.Element => (
  <OverviewGraph pending={0} transparent={0} confidential={0} />
)

export const withNoPending = (): JSX.Element => (
  <OverviewGraph pending={0} confidential={1} transparent={2} />
)

export const withJustPending = (): JSX.Element => (
  <OverviewGraph pending={1} confidential={0} transparent={0} />
)

export const withJustConfidential = (): JSX.Element => (
  <OverviewGraph pending={0} confidential={1} transparent={0} />
)

export const withJustTransparent = (): JSX.Element => (
  <OverviewGraph pending={0} confidential={0} transparent={1} />
)

export const interactive = (): JSX.Element => {
  return (
    <OverviewGraph
      confidential={number('Confidential', 1)}
      transparent={number('Transparent', 2)}
      pending={number('Pending', 3)}
    />
  )
}
