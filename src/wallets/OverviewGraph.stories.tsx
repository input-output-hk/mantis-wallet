import React from 'react'
import {OverviewGraph} from './OverviewGraph'

export default {
  title: 'Overview Graph',
}

export const withZeroBalance = (): JSX.Element => (
  <OverviewGraph pending={0} transparent={0} confidental={0} />
)
export const withDemoBalance = (): JSX.Element => (
  <OverviewGraph pending={3815.62} confidental={15262.46} transparent={6359.36} />
)
export const withNoPending = (): JSX.Element => (
  <OverviewGraph pending={0} confidental={15262.46} transparent={6359.36} />
)
export const withJustPending = (): JSX.Element => (
  <OverviewGraph pending={1} confidental={0} transparent={0} />
)
