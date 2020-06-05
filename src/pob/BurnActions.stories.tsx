import React from 'react'
import BigNumber from 'bignumber.js'
import {withKnobs, number, text} from '@storybook/addon-knobs'
import {action} from '@storybook/addon-actions'
import {prover, asyncAction} from '../storybook-util/custom-knobs'
import {withTheme} from '../storybook-util/theme-switcher'
import {BurnBalanceDisplay} from './BurnBalanceDisplay'
import {CHAINS} from './chains'
import {BurnActions} from './BurnActions'
import {withWalletState} from '../storybook-util/wallet-state-decorator'
import {withBuildJobState} from '../storybook-util/build-job-state-decorator'
import {AddBurnTxModal} from './modals/AddBurnTxModal'
import {UNITS} from '../common/units'

export default {
  title: 'Burn Actions',
  decorators: [withTheme, withKnobs, withWalletState, withBuildJobState],
}

const {BTC_TESTNET, ETH_TESTNET} = CHAINS

const dummyBurnBalances = [
  {
    chain: BTC_TESTNET,
    available: UNITS[BTC_TESTNET.unitType].toBasic(new BigNumber(1000)),
    pending: UNITS[BTC_TESTNET.unitType].toBasic(new BigNumber(0)),
  },
  {
    chain: ETH_TESTNET,
    available: UNITS[ETH_TESTNET.unitType].toBasic(new BigNumber(132.456)),
    pending: UNITS[ETH_TESTNET.unitType].toBasic(new BigNumber(12.345)),
  },
]

export const emptyBurnActions = (): JSX.Element => (
  <BurnActions
    burnBalances={[]}
    provers={[prover('First')]}
    burnAddresses={{}}
    addTx={async (...args): Promise<void> => {
      action('on-generate-address')(args)
    }}
    onBurnCoins={action('on-burn-coins')}
    onRegisterAuction={action('on-register-auction')}
  />
)

export const dummyBurnActions = (): JSX.Element => (
  <BurnActions
    burnBalances={dummyBurnBalances}
    onBurnCoins={action('on-burn-coins')}
    provers={[prover('First')]}
    burnAddresses={{
      [text('Burn Address Ethereum', 'burn-address-ethereum')]: {
        midnightAddress: 'midnight-address',
        chainId: 'ETH_TESTNET',
        reward: 1,
        autoConversion: false,
      },
      [text('Burn Address Bitcoin', 'burn-address-bitcoin')]: {
        midnightAddress: 'midnight-address',
        chainId: 'BTC_TESTNET',
        reward: 1,
        autoConversion: false,
      },
    }}
    addTx={async (...args): Promise<void> => {
      action('on-generate-address')(args)
    }}
    onRegisterAuction={action('on-register-auction')}
  />
)

export const burnBalanceEthereum = (): JSX.Element => (
  <BurnBalanceDisplay
    balance={{
      chain: ETH_TESTNET,
      available: UNITS[ETH_TESTNET.unitType].toBasic(new BigNumber(number('Total', 1000))),
      pending: UNITS[ETH_TESTNET.unitType].toBasic(new BigNumber(number('Pending', 100))),
    }}
  />
)

export const burnBalanceBitcoin = (): JSX.Element => (
  <BurnBalanceDisplay
    balance={{
      chain: BTC_TESTNET,
      available: UNITS[BTC_TESTNET.unitType].toBasic(new BigNumber(number('Total', 1000))),
      pending: UNITS[BTC_TESTNET.unitType].toBasic(new BigNumber(number('Pending', 100))),
    }}
  />
)

export const addTransactionModal = (): JSX.Element => (
  <AddBurnTxModal
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
    burnAddresses={{
      [text('Burn Address Ethereum', 'burn-address-ethereum')]: {
        midnightAddress: 'midnight-address',
        chainId: 'ETH_TESTNET',
        reward: 1,
        autoConversion: false,
      },
      [text('Burn Address Bitcoin', 'burn-address-bitcoin')]: {
        midnightAddress: 'midnight-address',
        chainId: 'BTC_TESTNET',
        reward: 1,
        autoConversion: false,
      },
    }}
    onAddTx={asyncAction('on-generate-address')}
    onCancel={action('on-cancel')}
    visible
  />
)
