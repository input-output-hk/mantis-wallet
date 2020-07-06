import React from 'react'
import {some} from 'fp-ts/lib/Option'
import {ESSENTIAL_DECORATORS} from '../storybook-util/essential-decorators'
import {withRouterState} from '../storybook-util/router-state-decorator'
import {withWalletState} from '../storybook-util/wallet-state-decorator'
import {withBuildJobState} from '../storybook-util/build-job-state-decorator'
import {WalletError} from './WalletErrorScreen'

export default {
  title: 'Wallet States',
  decorators: [...ESSENTIAL_DECORATORS, withRouterState, withWalletState, withBuildJobState],
  parameters: {
    withWalletState: {
      walletStatus: 'ERROR',
      error: some(Error('Example error')),
    },
  },
}

export const walletError = (): JSX.Element => <WalletError />
