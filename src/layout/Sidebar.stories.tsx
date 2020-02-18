import React from 'react'
import {action} from '@storybook/addon-actions'
import {withKnobs, boolean} from '@storybook/addon-knobs'
import {BrowserRouter} from 'react-router-dom'
import {Sidebar} from './Sidebar'
import {WalletState} from '../common/wallet-state'
import {LogOutModal} from '../wallets/modals/LogOutModal'

export default {
  title: 'Sidebar',
  decorators: [withKnobs],
}

export const sidebar = (): JSX.Element => (
  <BrowserRouter>
    <WalletState.Provider>
      <Sidebar />
    </WalletState.Provider>
  </BrowserRouter>
)

export const emptyTransactionModal = (): JSX.Element => (
  <LogOutModal
    visible
    onLogOut={async (...args): Promise<boolean> => {
      action('on-log-out')(args)
      return boolean('Successful log out', true)
    }}
  />
)
