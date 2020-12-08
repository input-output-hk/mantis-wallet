import React from 'react'
import {text, array} from '@storybook/addon-knobs'
import {action} from '@storybook/addon-actions'
import {ESSENTIAL_DECORATORS} from '../storybook-util/essential-decorators'
import {WalletPathChooser} from './WalletPathChooser'
import {WalletRestore} from './WalletRestore'
import {WalletCreate} from './WalletCreate'
import {WalletCreateDefineStep} from './create/WalletCreateDefineStep'
import {WalletCreateSecurityStep} from './create/WalletCreateSecurityStep'
import {WalletCreateDisplayRecoveryStep} from './create/WalletCreateDisplayRecoveryStep'
import {WalletCreateVerifyRecoveryStep} from './create/WalletCreateVerifyRecoveryStep'
import {TermsAndConditionsStep} from './TermsAndConditionsStep'

export default {
  title: 'Wallet Setup',
  decorators: ESSENTIAL_DECORATORS,
  parameters: {withWalletState: {walletStatus: 'NO_WALLET'}},
}

export const termsAndConditions = (): JSX.Element => (
  <TermsAndConditionsStep next={action('next')} />
)

export const showPathChooser = (): JSX.Element => (
  <WalletPathChooser
    goToCreate={action('Go to Create Wallet')}
    goToRestore={action('Go to Restore Wallet')}
  />
)

export const showWalletRestore = (): JSX.Element => (
  <WalletRestore cancel={action('Cancel Restore')} finish={action('Finished Restore')} />
)

export const showWalletCreate = (): JSX.Element => (
  <WalletCreate cancel={action('Cancel Create')} finish={action('Finished Create')} />
)

export const showWalletCreateDefineStep = (): JSX.Element => (
  <WalletCreateDefineStep
    cancel={action('on-cancel')}
    next={async (walletName, seedPhrase): Promise<void> =>
      action('on-next')({walletName, seedPhrase})
    }
  />
)

export const showWalletCreateSecurityStep = (): JSX.Element => (
  <WalletCreateSecurityStep
    cancel={action('on-cancel')}
    next={action('on-next')}
    privateKey={text(
      'Private key',
      '75cc353f301d9f23a3a3c936d9b306af8fbb59f43e95244fe84ff3f301d9f23a3a3c936d9b306af8fbb59f43e95244fe83f301d9f2375cc353f301d9f23a3a3c936d9b306af8fbb59f43e95244fe84ff3f301d9f23a3a3c936d9b306af8fbb5',
    )}
  />
)

export const showWalletCreateDisplaySeedStep = (): JSX.Element => (
  <WalletCreateDisplayRecoveryStep
    back={action('on-back')}
    next={action('on-next')}
    seedPhrase={array('Recovery Phrase', [
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

export const showWalletCreateVerifyRecoveryStep = (): JSX.Element => (
  <WalletCreateVerifyRecoveryStep
    back={action('on-back')}
    finish={action('on-finish')}
    seedPhrase={array('Recovery Phrase', [
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
    shuffledSeedPhrase={array('Recovery Phrase Shuffled', [
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
