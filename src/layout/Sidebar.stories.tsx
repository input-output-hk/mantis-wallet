import React from 'react'
import {action} from '@storybook/addon-actions'
import {withKnobs, boolean} from '@storybook/addon-knobs'
import {withTheme} from '../storybook-util/theme-switcher'
import {withWalletState} from '../storybook-util/wallet-state-decorator'
import {RouterState} from '../router-state'
import {Sidebar} from './Sidebar'
import {LogOutModal} from '../wallets/modals/LogOutModal'

export default {
  title: 'Sidebar',
  decorators: [withWalletState, withTheme, withKnobs],
}

export const sidebar = (): JSX.Element => (
  <RouterState.Provider>
    <Sidebar />
  </RouterState.Provider>
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
