import {select, text, number} from '@storybook/addon-knobs'
import {action, ActionOptions} from '@storybook/addon-actions'
import _ from 'lodash'
import BigNumber from 'bignumber.js'
import {Prover} from '../pob/pob-state'
import {Chain, CHAINS, ALL_CHAIN_IDS} from '../pob/chains'
import {UNITS} from '../common/units'
import {BurnStatusType} from '../pob/api/prover'

export const selectChain = (): Chain => CHAINS[select('Select chain', ALL_CHAIN_IDS, 'BTC_MAINNET')]

export const selectBurnStatus = (name = 'Burn Status'): BurnStatusType =>
  select(
    name,
    [
      'tx_found',
      'commitment_submitted',
      'commitment_appeared',
      'redeem_submitted',
      'redeem_appeared',
      'redeem_another_prover',
      'proof_fail',
      'commitment_fail',
      'redeem_fail',
    ],
    'tx_found',
  )

export const dust = (name: string, value: number): BigNumber =>
  UNITS.Dust.toBasic(new BigNumber(number(name, value)))

export const prover = (name: string, value: Partial<Prover> = {}): Prover => {
  const mergedValue: Prover = _.merge(
    {
      name: `${name} prover`,
      address: `${_.lowerCase(name)}.prover.address`,
      reward: 1,
      rewards: {
        BTC_TESTNET: 10,
        ETH_TESTNET: 15,
      },
    },
    value,
  )

  return {
    name: text(`${name} prover`, mergedValue.name),
    address: text(`${name} prover address`, mergedValue.address),
    rewards: _.mapValues(mergedValue.rewards, (v: number, k) =>
      number(`${name} prover ${k} reward`, v),
    ),
  }
}

export const asyncAction = (
  name: string,
  delay = 1000,
  options?: ActionOptions | undefined,
  // eslint-disable-next-line
): ((...args: any[]) => Promise<void>) => {
  return (...args) =>
    new Promise(function(resolve) {
      setTimeout(resolve, delay)
    }).then(() => action(name, options)(args))
}
