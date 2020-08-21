import React from 'react'
import BigNumber from 'bignumber.js'
import {number, text} from '@storybook/addon-knobs'
import {action} from '@storybook/addon-actions'
import {prover, asyncAction} from '../storybook-util/custom-knobs'
import {ESSENTIAL_DECORATORS} from '../storybook-util/essential-decorators'
import {BurnBalanceDisplay} from './BurnBalanceDisplay'
import {POB_CHAINS} from './pob-chains'
import {BurnActions} from './BurnActions'
import {withWalletState} from '../storybook-util/wallet-state-decorator'
import {withBuildJobState} from '../storybook-util/build-job-state-decorator'
import {AddBurnTxModal} from './modals/AddBurnTxModal'
import {UNITS} from '../common/units'
import {MIDNIGHT_TOKEN_CONTRACTS} from './pob-config'

export default {
  title: 'Burn Actions',
  decorators: [...ESSENTIAL_DECORATORS, withWalletState, withBuildJobState],
}

const {BTC_TESTNET, ETH_TESTNET} = POB_CHAINS

export const emptyBurnActions = (): JSX.Element => (
  <BurnActions
    transparentAccounts={[]}
    pendingBalances={{}}
    provers={[prover('First')]}
    burnAddresses={{}}
    addTx={async (...args): Promise<void> => {
      action('on-generate-address')(args)
    }}
    onBurnCoins={action('on-burn-coins')}
  />
)

export const dummyBurnActions = (): JSX.Element => {
  const someProver = prover('First')
  return (
    <BurnActions
      transparentAccounts={[
        {
          address: 'first-transparent-address',
          index: 0,
          balance: new BigNumber(0),
          tokens: {
            [MIDNIGHT_TOKEN_CONTRACTS.BTC_TESTNET]: UNITS[BTC_TESTNET.unitType].toBasic(
              new BigNumber(1000),
            ),
            [MIDNIGHT_TOKEN_CONTRACTS.ETH_TESTNET]: UNITS[ETH_TESTNET.unitType].toBasic(
              new BigNumber(132.456),
            ),
          },
        },
      ]}
      pendingBalances={{
        ETH_TESTNET: UNITS[ETH_TESTNET.unitType].toBasic(new BigNumber(12.345)),
      }}
      onBurnCoins={action('on-burn-coins')}
      provers={[someProver]}
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
    />
  )
}

export const burnBalanceEthereum = (): JSX.Element => (
  <BurnBalanceDisplay
    chain={ETH_TESTNET}
    available={UNITS[ETH_TESTNET.unitType].toBasic(new BigNumber(number('Total', 1000)))}
    pending={UNITS[ETH_TESTNET.unitType].toBasic(new BigNumber(number('Pending', 100)))}
  />
)

export const burnBalanceBitcoin = (): JSX.Element => (
  <BurnBalanceDisplay
    chain={BTC_TESTNET}
    available={UNITS[BTC_TESTNET.unitType].toBasic(new BigNumber(number('Total', 1000)))}
    pending={UNITS[BTC_TESTNET.unitType].toBasic(new BigNumber(number('Pending', 100)))}
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
