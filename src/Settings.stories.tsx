import React from 'react'
import {action} from '@storybook/addon-actions'
import {ESSENTIAL_DECORATORS} from './storybook-util/essential-decorators'
import {Settings} from './Settings'
import {ExportPrivateKeyModal} from './wallets/modals/ExportPrivateKey'

export default {
  title: 'Settings',
  decorators: ESSENTIAL_DECORATORS,
}

export const settings = (): JSX.Element => <Settings />

export const exportPrivateKeyModal = (): JSX.Element => (
  <ExportPrivateKeyModal
    getPrivateKey={async () => 'example-private-key'}
    onCancel={action('onCancel')}
    visible
  />
)
