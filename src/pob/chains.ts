import bitcoinLogo from '../assets/icons/chains/bitcoin.svg'
import bitcoinClippedLogo from '../assets/icons/chains/bitcoin-clipped.svg'
import bitcoinBurnLogo from '../assets/icons/chains/m-btc.svg'
import ethereumLogo from '../assets/icons/chains/ethereum.svg'
import ethereumClippedLogo from '../assets/icons/chains/ethereum-clipped.svg'
import ethereumBurnLogo from '../assets/icons/chains/m-eth.svg'
import {UnitType} from '../common/ShortNumber'

export const ALL_CHAIN_IDS = ['BTC_MAINNET', 'BTC_TESTNET', 'ETH_MAINNET', 'ETH_TESTNET'] as const
type ChainIdsType = typeof ALL_CHAIN_IDS

export type ChainId = ChainIdsType[number]

export interface Chain {
  id: ChainId
  numericId: number
  symbol: string
  name: string
  logo: string
  clippedLogo: string
  burnLogo: string
  unitType: UnitType
}

export const CHAINS: Record<ChainId, Chain> = {
  BTC_MAINNET: {
    id: 'BTC_MAINNET',
    numericId: 0,
    symbol: 'BTC',
    name: 'Bitcoin',
    logo: bitcoinLogo,
    clippedLogo: bitcoinClippedLogo,
    burnLogo: bitcoinBurnLogo,
    unitType: 'Bitcoin',
  },
  BTC_TESTNET: {
    id: 'BTC_TESTNET',
    numericId: 1,
    symbol: 'BTC',
    name: 'Bitcoin',
    logo: bitcoinLogo,
    clippedLogo: bitcoinClippedLogo,
    burnLogo: bitcoinBurnLogo,
    unitType: 'Bitcoin',
  },
  ETH_MAINNET: {
    id: 'ETH_MAINNET',
    numericId: 2,
    symbol: 'ETH',
    name: 'Ethereum',
    logo: ethereumLogo,
    clippedLogo: ethereumClippedLogo,
    burnLogo: ethereumBurnLogo,
    unitType: 'Ether',
  },
  ETH_TESTNET: {
    id: 'ETH_TESTNET',
    numericId: 3,
    symbol: 'ETH',
    name: 'Ethereum',
    logo: ethereumLogo,
    clippedLogo: ethereumClippedLogo,
    burnLogo: ethereumBurnLogo,
    unitType: 'Ether',
  },
}

// FIXME: refactor chains for general usage (including ETC and DUST)
export const DUST_SYMBOL = 'DT'
