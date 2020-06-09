import React from 'react'
import {withKnobs} from '@storybook/addon-knobs'
import {action} from '@storybook/addon-actions'
import {withTheme} from './storybook-util/theme-switcher'
import {withWalletState} from './storybook-util/wallet-state-decorator'
import {withRouterState} from './storybook-util/router-state-decorator'
import {withMiningState} from './storybook-util/mining-state-decorator'
import {withBuildJobState} from './storybook-util/build-job-state-decorator'
import {Settings} from './Settings'
import {RestartPrompt} from './RemoteSettingsManager'

export default {
  title: 'Settings',
  decorators: [
    withTheme,
    withMiningState,
    withWalletState,
    withRouterState,
    withKnobs,
    withBuildJobState,
  ],
}

export const settings = (): JSX.Element => <Settings />

export const restartPrompt = (): JSX.Element => (
  <RestartPrompt onCancel={action('onCancel')} onRestart={action('onRestart')} visible />
)
