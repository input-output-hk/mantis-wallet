import React from 'react'
import {action} from '@storybook/addon-actions'
import {withKnobs, text, array} from '@storybook/addon-knobs'
import {withTheme} from '../storybook-util/theme-switcher'
import {CreateBurnModal} from './modals/CreateBurnModal'
import {WatchBurnModal} from './modals/WatchBurnModal'
import {BurnCentre} from './BurnCentre'
import {withWalletState} from '../storybook-util/wallet-state-decorator'
import {withPobState} from '../storybook-util/pob-state-decorator'

export default {
  title: 'Burn Centre',
  decorators: [withTheme, withKnobs, withWalletState, withPobState],
}

export const burnCentre = (): JSX.Element => <BurnCentre />

export const createBurnModal = (): JSX.Element => (
  <CreateBurnModal
    visible
    provers={[
      {
        name: text('First prover', 'First prover'),
        address: text('First prover address', 'first.prover.address'),
      },
      {
        name: text('Second prover', 'Second prover'),
        address: text('Second prover address', 'second.prover.address'),
      },
    ]}
    transparentAddresses={array('Transparent addresses', ['first-address', 'second-address'])}
    errorMessage={text('Error message', '')}
    onCancel={action('on-canel')}
    onCreateBurn={async (...args): Promise<void> => action('on-create-burn')(args)}
  />
)

export const watchBurnModal = (): JSX.Element => (
  <WatchBurnModal
    visible
    provers={[
      {
        name: text('First prover', 'First prover'),
        address: text('First prover address', 'first.prover.address'),
      },
      {
        name: text('Second prover', 'Second prover'),
        address: text('Second prover address', 'second.prover.address'),
      },
    ]}
    onCancel={action('on-canel')}
    onWatchBurn={action('on-watch')}
  />
)
