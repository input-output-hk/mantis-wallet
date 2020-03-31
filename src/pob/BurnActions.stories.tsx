import React from 'react'
import BigNumber from 'bignumber.js'
import {withKnobs, number, text} from '@storybook/addon-knobs'
import {action} from '@storybook/addon-actions'
import {withTheme} from '../storybook-util/theme-switcher'
import {BurnBalanceDisplay} from './BurnBalanceDisplay'
import {CHAINS} from './chains'
import {BurnActions} from './BurnActions'
import {withWalletState} from '../storybook-util/wallet-state-decorator'
import {withPobState} from '../storybook-util/pob-state-decorator'
import {AddBurnTxModal} from './modals/AddBurnTxModal'
import {UNITS} from '../common/units'

export default {
  title: 'Burn Actions',
  decorators: [withTheme, withKnobs, withWalletState, withPobState],
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
    onBurnCoins={action('on-burn-coins')}
    onRegisterAuction={action('on-register-auction')}
  />
)

export const dummyBurnActions = (): JSX.Element => (
  <BurnActions
    burnBalances={dummyBurnBalances}
    onBurnCoins={action('on-burn-coins')}
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
      {
        name: text('First prover', 'First prover'),
        address: text('First prover address', 'first.prover.address'),
        reward: number('First prover reward', 0.01),
      },
      {
        name: text('Second prover', 'Second prover'),
        address: text('Second prover address', 'second.prover.address'),
        reward: 10,
      },
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
    onAddTx={async (...args): Promise<void> => {
      action('on-generate-address')(args)
    }}
    onCancel={action('on-cancel')}
    visible
  />
)
