import React from 'react'
import BigNumber from 'bignumber.js'
import {toWei} from 'web3/lib/utils/utils.js'
import {withKnobs, number} from '@storybook/addon-knobs'
import {action} from '@storybook/addon-actions'
import {withTheme} from '../storybook-util/theme-switcher'
import {BurnBalance} from './BurnBalance'
import {CHAINS} from './chains'
import {BurnActions} from './BurnActions'
import {withWalletState} from '../storybook-util/wallet-state-decorator'
import {withPobState} from '../storybook-util/pob-state-decorator'
import {toSatoshi} from '../common/util'

export default {
  title: 'Burn Actions',
  decorators: [withTheme, withKnobs, withWalletState, withPobState],
}

const dummyBurnBalances = [
  {
    address: 'text-address',
    chain: CHAINS[1],
    total: toSatoshi(new BigNumber(1000)),
    pending: toSatoshi(new BigNumber(0)),
  },
  {
    address: 'text-address',
    chain: CHAINS[3],
    total: toSatoshi(new BigNumber(1000)),
    pending: toSatoshi(new BigNumber(10)),
  },
  {
    address: 'text-address',
    chain: CHAINS[1],
    total: toWei(new BigNumber(132.456)),
    pending: toWei(new BigNumber(12.345)),
  },
  {
    address: 'text-address',
    chain: CHAINS[3],
    total: toWei(new BigNumber(132.456)),
    pending: toWei(new BigNumber(12.345)),
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
  <BurnBalance
    chain={CHAINS[3]}
    total={toWei(new BigNumber(number('Total', 1000)))}
    pending={toWei(new BigNumber(number('Pending', 100)))}
  />
)

export const burnBalanceBitcoin = (): JSX.Element => (
  <BurnBalance
    chain={CHAINS[1]}
    total={toSatoshi(new BigNumber(number('Total', 1000)))}
    pending={toSatoshi(new BigNumber(number('Pending', 100)))}
  />
)
