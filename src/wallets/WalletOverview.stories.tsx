import React from 'react'
import {withKnobs, number} from '@storybook/addon-knobs'
import {WalletOverview} from './WalletOverview'
import './WalletOverview.scss'

export default {
  title: 'Wallet Overview',
  decorators: [withKnobs],
}

export const withZeroBalance = (): JSX.Element => (
  <WalletOverview pending={0} transparent={0} confidential={0} />
)

export const interactive = (): JSX.Element => {
  return (
    <WalletOverview
      confidential={number('Confidential', 15262.46)}
      transparent={number('Transparent', 6359.36)}
      pending={number('Pending', 3815.62)}
    />
  )
}
