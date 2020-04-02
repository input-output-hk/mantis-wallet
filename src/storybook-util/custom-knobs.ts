import {select, text, number} from '@storybook/addon-knobs'
import _ from 'lodash'
import BigNumber from 'bignumber.js'
import {Prover} from '../pob/pob-state'
import {Chain, CHAINS, ALL_CHAIN_IDS} from '../pob/chains'
import {UNITS} from '../common/units'

export const selectChain = (): Chain => CHAINS[select('Select chain', ALL_CHAIN_IDS, 'BTC_MAINNET')]

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
