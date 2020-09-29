import React from 'react'
import {text} from '@storybook/addon-knobs'
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
    <Sidebar version={text('Version', 'v0.11.1')} />
  </RouterState.Provider>
)

export const removeWalletModal = (): JSX.Element => (
  <RemoveWalletModal
    visible
    onCancel={action('on-cancel')}
    onRemoveWallet={asyncAction('on-log-out')}
  />
)
