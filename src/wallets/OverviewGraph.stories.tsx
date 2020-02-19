import React from 'react'
import {withKnobs, number} from '@storybook/addon-knobs'
import {withTheme} from '../storybook-util/theme-switcher'
import {OverviewGraph} from './OverviewGraph'

export default {
  title: 'Overview Graph',
  decorators: [withTheme, withKnobs],
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
