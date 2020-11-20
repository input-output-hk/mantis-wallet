import React from 'react'
import {action} from '@storybook/addon-actions'
import {ESSENTIAL_DECORATORS} from '../storybook-util/essential-decorators'
import {RouterState} from '../router-state'
import {Sidebar} from './Sidebar'
import {RemoveWalletModal} from '../wallets/modals/RemoveWalletModal'
import {asyncAction} from '../storybook-util/custom-knobs'
import {toFullScreen} from '../storybook-util/full-screen-decorator'
import {withTokensState} from '../storybook-util/tokens-state-decorator'

export default {
  title: 'Sidebar',
  decorators: [...ESSENTIAL_DECORATORS, withTokensState, toFullScreen],
}

export const sidebar = (): JSX.Element => (
  <RouterState.Provider>
    <Sidebar />
  </RouterState.Provider>
)

export const removeWalletModal = (): JSX.Element => (
  <RemoveWalletModal
    visible
    onCancel={action('on-cancel')}
    onRemoveWallet={asyncAction('on-log-out')}
  />
)
