import {select} from '@storybook/addon-knobs'
import {Chain, CHAINS, ALL_CHAIN_IDS} from '../pob/chains'

export const selectChain = (): Chain => CHAINS[select('Select chain', ALL_CHAIN_IDS, 'BTC_MAINNET')]
