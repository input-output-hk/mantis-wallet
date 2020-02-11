import React from 'react'
import {withKnobs, number} from '@storybook/addon-knobs'
import BigNumber from 'bignumber.js'
import {withTheme} from '../storybook-util/theme-switcher'
import {withWalletState} from '../storybook-util/wallet-state-decorator'
import {toWei} from 'web3/lib/utils/utils.js'
import {WalletOverview} from './WalletOverview'
import './WalletOverview.scss'

export default {
  title: 'Wallet Overview',
  decorators: [withWalletState, withTheme, withKnobs],
}

export const withZeroBalance = (): JSX.Element => (
  <WalletOverview
    pending={new BigNumber(0)}
    transparent={new BigNumber(0)}
    confidential={new BigNumber(0)}
  />
)

export const interactive = (): JSX.Element => {
  return (
    <WalletOverview
      confidential={toWei(new BigNumber(number('Confidential', 15262.4578)))}
      transparent={toWei(new BigNumber(number('Transparent', 6359.36)))}
      pending={toWei(new BigNumber(number('Pending', 3815.62)))}
    />
  )
}
