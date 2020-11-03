import React from 'react'
import {some} from 'fp-ts/lib/Option'
import {ESSENTIAL_DECORATORS} from '../storybook-util/essential-decorators'
import {WalletError} from './WalletErrorScreen'

export default {
  title: 'Wallet States',
  decorators: ESSENTIAL_DECORATORS,
  parameters: {
    withWalletState: {
      walletStatus: 'ERROR',
      error: some(Error('Example error')),
    },
  },
}

export const walletError = (): JSX.Element => <WalletError countdownStart={60} />
