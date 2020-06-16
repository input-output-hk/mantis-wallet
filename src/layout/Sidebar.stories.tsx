import React from 'react'
import {text} from '@storybook/addon-knobs'
import {action} from '@storybook/addon-actions'
import {ESSENTIAL_DECORATORS} from '../storybook-util/essential-decorators'
import {withWalletState} from '../storybook-util/wallet-state-decorator'
import {withPobState} from '../storybook-util/pob-state-decorator'
import {withGlacierState} from '../storybook-util/glacier-state-decorator'
import {withBuildJobState} from '../storybook-util/build-job-state-decorator'
import {RouterState} from '../router-state'
import {Sidebar} from './Sidebar'
import {LogOutModal} from '../wallets/modals/LogOutModal'
import {asyncAction} from '../storybook-util/custom-knobs'
import {toFullScreen} from '../storybook-util/full-screen-decorator'

export default {
  title: 'Sidebar',
  decorators: [
    ...ESSENTIAL_DECORATORS,
    withWalletState,
    withPobState,
    withGlacierState,
    withBuildJobState,
    toFullScreen,
  ],
}

export const sidebar = (): JSX.Element => (
  <RouterState.Provider>
    <Sidebar version={text('Version', 'v0.11.1')} />
  </RouterState.Provider>
)

export const logOutModal = (): JSX.Element => (
  <LogOutModal visible onCancel={action('on-cancel')} onLogOut={asyncAction('on-log-out')} />
)
