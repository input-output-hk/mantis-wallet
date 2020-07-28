import {Chain, ETH_CHAIN, BTC_CHAIN} from '../common/chains'
import bitcoinBurnLogo from '../assets/icons/chains/m-btc.svg'
import ethereumBurnLogo from '../assets/icons/chains/m-eth.svg'

export const ALL_POB_CHAIN_IDS = [
  'BTC_MAINNET',
  'BTC_TESTNET',
  'ETH_MAINNET',
  'ETH_TESTNET',
] as const
export type PobChainId = typeof ALL_POB_CHAIN_IDS[number]

export interface PobChain extends Chain {
  id: PobChainId
  numericId: number
  name: string
  burnLogo: string
}

export const POB_CHAINS: Record<PobChainId, PobChain> = {
  BTC_MAINNET: {
    id: 'BTC_MAINNET',
    numericId: 0,
    name: 'Bitcoin',
    burnLogo: bitcoinBurnLogo,
    ...BTC_CHAIN,
  },
  BTC_TESTNET: {
    id: 'BTC_TESTNET',
    numericId: 1,
    name: 'Bitcoin',
    burnLogo: bitcoinBurnLogo,
    ...BTC_CHAIN,
  },
  ETH_MAINNET: {
    id: 'ETH_MAINNET',
    numericId: 2,
    name: 'Ethereum',
    burnLogo: ethereumBurnLogo,
    ...ETH_CHAIN,
  },
  ETH_TESTNET: {
    id: 'ETH_TESTNET',
    numericId: 3,
    name: 'Ethereum',
    burnLogo: ethereumBurnLogo,
    ...ETH_CHAIN,
  },
}
