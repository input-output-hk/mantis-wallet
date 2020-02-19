import React from 'react'
import {withKnobs, number} from '@storybook/addon-knobs'
import Big from 'big.js'
import {withTheme} from '../storybook-util/theme-switcher'
import {withWalletState} from '../storybook-util/wallet-state-decorator'
import {WalletOverview} from './WalletOverview'
import './WalletOverview.scss'

export default {
  title: 'Wallet Overview',
  decorators: [withWalletState, withTheme, withKnobs],
}

export const withZeroBalance = (): JSX.Element => (
  <WalletOverview pending={Big(0)} transparent={Big(0)} confidential={Big(0)} />
)

export const interactive = (): JSX.Element => {
  return (
    <WalletOverview
      confidential={Big(number('Confidential', 15262.46))}
      transparent={Big(number('Transparent', 6359.36))}
      pending={Big(number('Pending', 3815.62))}
    />
  )
}
