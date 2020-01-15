import React from 'react'
import {action} from '@storybook/addon-actions'
import {WalletPathChooser} from './WalletPathChooser'
import {WalletRestore} from './WalletRestore'
import {WalletCreate} from './WalletCreate'

export default {
  title: 'Wallet Setup',
}

export const showPathChooser = (): JSX.Element => (
  <WalletPathChooser
    goToCreate={action('Go to Create Wallet')}
    goToRestore={action('Go to Restore Wallet')}
  />
)

export const showWalletRestore = (): JSX.Element => (
  <WalletRestore cancel={action('Cancel Restore')} />
)

export const showWalletCreate = (): JSX.Element => (
  <WalletCreate cancel={action('Cancel Restore')} />
)
