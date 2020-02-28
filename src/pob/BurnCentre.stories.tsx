import React from 'react'
import {action} from '@storybook/addon-actions'
import {withKnobs, text, number} from '@storybook/addon-knobs'
import {withTheme} from '../storybook-util/theme-switcher'
import {WatchBurnModal} from './modals/WatchBurnModal'
import {BurnCentre} from './BurnCentre'
import {withWalletState} from '../storybook-util/wallet-state-decorator'
import {withPobState} from '../storybook-util/pob-state-decorator'
import {withRouterState} from '../storybook-util/router-state-decorator'

export default {
  title: 'Burn Centre',
  decorators: [withTheme, withKnobs, withWalletState, withPobState, withRouterState],
}

export const burnCentre = (): JSX.Element => <BurnCentre />

export const watchBurnModal = (): JSX.Element => (
  <WatchBurnModal
    visible
    provers={[
      {
        name: text('First prover', 'First prover'),
        address: text('First prover address', 'first.prover.address'),
        reward: number('First prover reward', 0.01),
      },
      {
        name: text('Second prover', 'Second prover'),
        address: text('Second prover address', 'second.prover.address'),
        reward: number('Second prover reward', 10),
      },
    ]}
    onCancel={action('on-canel')}
    onWatchBurn={action('on-watch')}
  />
)
