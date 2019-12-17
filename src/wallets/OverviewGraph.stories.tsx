import React from 'react'
import {withKnobs, number} from '@storybook/addon-knobs'
import {OverviewGraph} from './OverviewGraph'

export default {
  title: 'Overview Graph',
  decorators: [withKnobs],
}

export const withZeroBalance = (): JSX.Element => (
  <OverviewGraph pending={0} transparent={0} confidental={0} />
)

export const withNoPending = (): JSX.Element => (
  <OverviewGraph pending={0} confidental={1} transparent={2} />
)

export const withJustPending = (): JSX.Element => (
  <OverviewGraph pending={1} confidental={0} transparent={0} />
)

export const withJustConfidental = (): JSX.Element => (
  <OverviewGraph pending={0} confidental={1} transparent={0} />
)

export const withJustTransparent = (): JSX.Element => (
  <OverviewGraph pending={0} confidental={0} transparent={1} />
)

export const interactive = (): JSX.Element => {
  return (
    <OverviewGraph
      confidental={number('Confidental', 1)}
      transparent={number('Transparent', 2)}
      pending={number('Pending', 3)}
    />
  )
}
