import {select, number} from '@storybook/addon-knobs'
import BigNumber from 'bignumber.js'
import {Chain, CHAINS, ALL_CHAIN_IDS} from '../pob/chains'
import {UNITS} from '../common/units'

export const selectChain = (): Chain => CHAINS[select('Select chain', ALL_CHAIN_IDS, 'BTC_MAINNET')]

export const dust = (name: string, value: number): BigNumber =>
  UNITS.Dust.toBasic(new BigNumber(number(name, value)))
