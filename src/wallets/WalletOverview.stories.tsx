import React from 'react'
import {WalletOverview} from './WalletOverview'
import './WalletOverview.scss'

export default {
  title: 'Wallet Overview',
}

export const withZeroBalance = (): JSX.Element => (
  <WalletOverview pending={0} transparent={0} confidental={0} />
)
export const withDemoBalance = (): JSX.Element => (
  <WalletOverview pending={3815.62} confidental={15262.46} transparent={6359.36} />
)
