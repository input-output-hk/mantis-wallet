import React from 'react'
import {withKnobs, text, array} from '@storybook/addon-knobs'
import {action} from '@storybook/addon-actions'
import {WalletPathChooser} from './WalletPathChooser'
import {WalletRestore} from './WalletRestore'
import {WalletCreate} from './WalletCreate'
import {WalletCreateDefineStep} from './create/WalletCreateDefineStep'
import {WalletCreateSecurityStep} from './create/WalletCreateSecurityStep'
import {WalletCreateDisplayRecoveryStep} from './create/WalletCreateDisplayRecoveryStep'
import {WalletCreateVerifyRecoveryStep} from './create/WalletCreateVerifyRecoveryStep'

export default {
  title: 'Wallet Setup',
  decorators: [withKnobs],
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

export const showWalletCreateDefineStep = (): JSX.Element => (
  <WalletCreateDefineStep cancel={action('on-cancel')} next={action('on-next')} />
)

export const showWalletCreateSecurityStep = (): JSX.Element => (
  <WalletCreateSecurityStep
    back={action('on-back')}
    next={action('on-next')}
    privateKey={text(
      'Private key',
      '75cc353f301d9f23a3a3c936d9b306af8fbb59f43e95244fe84ff3f301d9f23a3a3c936d9b306af8fbb59f43e95244fe83f301d9f2375cc353f301d9f23a3a3c936d9b306af8fbb59f43e95244fe84ff3f301d9f23a3a3c936d9b306af8fbb5',
    )}
  />
)

export const showWalletCreateDisplaySeedStep = (): JSX.Element => (
  <WalletCreateDisplayRecoveryStep back={action('on-back')} next={action('on-next')} />
)

export const showWalletCreateVerifyRecoveryStep = (): JSX.Element => (
  <WalletCreateVerifyRecoveryStep
    back={action('on-back')}
    finish={action('on-finish')}
    recoveryPhrase={array('Recovery Phrase', [
      'vengeful',
      'legs',
      'cute',
      'rifle',
      'bite',
      'spell',
      'ambiguous',
      'impossible',
      'fabulous',
      'observe',
      'offer',
      'baseball',
    ])}
  />
)
