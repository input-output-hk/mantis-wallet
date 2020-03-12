import React from 'react'
import {action} from '@storybook/addon-actions'
import {withKnobs, text, array, number, select} from '@storybook/addon-knobs'
import {withTheme} from '../storybook-util/theme-switcher'
import {BurnCoins} from './BurnCoins'
import {withWalletState} from '../storybook-util/wallet-state-decorator'
import {withPobState} from '../storybook-util/pob-state-decorator'
import {withRouterState} from '../storybook-util/router-state-decorator'
import {BurnCoinsChooseToken} from './burn-coins/BurnCoinsChooseToken'
import {CHAINS} from './chains'
import {BurnCoinsGenerateAddress} from './burn-coins/BurnCoinsGenerateAddress'
import {BurnCoinsShowAddress} from './burn-coins/BurnCoinsShowAddress'
import {BurnCoinsTransparentAddress} from './burn-coins/BurnCoinsTransparentAddress'

export default {
  title: 'Burn Coins',
  decorators: [withTheme, withKnobs, withWalletState, withPobState, withRouterState],
}

export const burnCoins = (): JSX.Element => <BurnCoins />

export const transparentAddress = (): JSX.Element => (
  <BurnCoinsTransparentAddress
    cancel={action('on-cancel')}
    generateTransparentAddress={async (...args): Promise<void> => {
      action('on-generate-transparent-address')(args)
    }}
  />
)

export const chooseToken = (): JSX.Element => (
  <BurnCoinsChooseToken chains={CHAINS} chooseChain={action('choose-chain')} />
)

export const generateAddress = (): JSX.Element => (
  <BurnCoinsGenerateAddress
    chain={CHAINS[select('Chain id', [0, 1, 2, 3], 0)]}
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
    transparentAddresses={array('Transparent addresses', ['first-address', 'second-address'])}
    cancel={action('on-cancel')}
    generateBurnAddress={async (...args): Promise<void> => {
      action('on-generate-address')(args)
    }}
  />
)

export const showAddress = (): JSX.Element => (
  <BurnCoinsShowAddress
    chain={CHAINS[number('Chain id', 0)]}
    burnAddress={text('Burn Address', 'test-address')}
    goBack={action('on-go-back')}
  />
)
