import React from 'react'
import {action} from '@storybook/addon-actions'
import {withKnobs} from '@storybook/addon-knobs'
import {withTheme} from '../storybook-util/theme-switcher'
import {WatchBurnModal} from './modals/WatchBurnModal'
import {BurnCentre} from './BurnCentre'
import {withWalletState} from '../storybook-util/wallet-state-decorator'
import {withPobState} from '../storybook-util/pob-state-decorator'
import {withRouterState} from '../storybook-util/router-state-decorator'
import {prover} from '../storybook-util/custom-knobs'

export default {
  title: 'Burn Centre',
  decorators: [withTheme, withKnobs, withWalletState, withPobState, withRouterState],
}

export const burnCentre = (): JSX.Element => <BurnCentre />

export const watchBurnModal = (): JSX.Element => (
  <WatchBurnModal
    visible
    provers={[
      prover('First', {
        rewards: {
          BTC_MAINNET: 150,
          BTC_TESTNET: 100,
          ETH_MAINNET: 250,
          ETH_TESTNET: 200,
        },
      }),
      prover('Second'),
    ]}
    onCancel={action('on-canel')}
    onWatchBurn={action('on-watch')}
  />
)
