import React from 'react'
import {withKnobs, number} from '@storybook/addon-knobs'
import Big from 'big.js'
import {WalletState} from '../common/wallet-state'
import {WalletOverview} from './WalletOverview'
import './WalletOverview.scss'

export default {
  title: 'Wallet Overview',
  decorators: [withKnobs],
}

export const withZeroBalance = (): JSX.Element => (
  <WalletState.Provider>
    <WalletOverview pending={Big(0)} transparent={Big(0)} confidential={Big(0)} />
  </WalletState.Provider>
)

export const interactive = (): JSX.Element => {
  return (
    <WalletState.Provider>
      <WalletOverview
        confidential={Big(number('Confidential', 15262.46))}
        transparent={Big(number('Transparent', 6359.36))}
        pending={Big(number('Pending', 3815.62))}
      />
    </WalletState.Provider>
  )
}