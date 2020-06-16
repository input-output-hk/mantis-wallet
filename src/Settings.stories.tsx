import React from 'react'
import {action} from '@storybook/addon-actions'
import {ESSENTIAL_DECORATORS} from './storybook-util/essential-decorators'
import {withWalletState} from './storybook-util/wallet-state-decorator'
import {withRouterState} from './storybook-util/router-state-decorator'
import {withBuildJobState} from './storybook-util/build-job-state-decorator'
import {Settings} from './Settings'
import {RestartPrompt} from './RemoteSettingsManager'

export default {
  title: 'Settings',
  decorators: [...ESSENTIAL_DECORATORS, withWalletState, withRouterState, withBuildJobState],
}

export const settings = (): JSX.Element => <Settings />

export const restartPrompt = (): JSX.Element => (
  <RestartPrompt onCancel={action('onCancel')} onRestart={action('onRestart')} visible />
)
