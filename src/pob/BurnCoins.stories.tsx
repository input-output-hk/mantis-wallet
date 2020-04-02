import React from 'react'
import _ from 'lodash'
import {action} from '@storybook/addon-actions'
import {withKnobs, text, array} from '@storybook/addon-knobs'
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
import {selectChain, prover} from '../storybook-util/custom-knobs'

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
  <BurnCoinsChooseToken chains={_.values(CHAINS)} chooseChain={action('choose-chain')} />
)

export const generateAddress = (): JSX.Element => (
  <BurnCoinsGenerateAddress
    chain={selectChain()}
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
    transparentAddresses={array('Transparent addresses', ['first-address', 'second-address'])}
    cancel={action('on-cancel')}
    generateBurnAddress={async (...args): Promise<void> => {
      action('on-generate-address')(args)
    }}
  />
)

export const showAddress = (): JSX.Element => (
  <BurnCoinsShowAddress
    chain={selectChain()}
    burnAddress={text('Burn Address', 'test-address')}
    goBack={action('on-go-back')}
  />
)
