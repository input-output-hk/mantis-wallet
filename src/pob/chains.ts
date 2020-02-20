import bitcoinLogo from '../assets/icons/chains/bitcoin.svg'
import bitcoinBurnLogo from '../assets/icons/chains/m-btc.svg'
import ethereumLogo from '../assets/icons/chains/ethereum.svg'
import ethereumBurnLogo from '../assets/icons/chains/m-eth.svg'

export type ChainId = 'BTC_MAINNET' | 'BTC_TESTNET' | 'ETH_MAINNET' | 'ETH_TESTNET'

export interface Chain {
  id: ChainId
  numericId: number
  symbol: string
  name: string
  logo: string
  burnLogo: string
}

export const CHAINS: Chain[] = [
  {
    id: 'BTC_MAINNET',
    numericId: 0,
    symbol: 'BTC',
    name: 'Bitcoin',
    logo: bitcoinLogo,
    burnLogo: bitcoinBurnLogo,
  },
  {
    id: 'BTC_TESTNET',
    numericId: 1,
    symbol: 'BTC',
    name: 'Bitcoin',
    logo: bitcoinLogo,
    burnLogo: bitcoinBurnLogo,
  },
  {
    id: 'ETH_MAINNET',
    numericId: 2,
    symbol: 'ETH',
    name: 'Ethereum',
    logo: ethereumLogo,
    burnLogo: ethereumBurnLogo,
  },
  {
    id: 'ETH_TESTNET',
    numericId: 3,
    symbol: 'ETH',
    name: 'Ethereum',
    logo: ethereumLogo,
    burnLogo: ethereumBurnLogo,
  },
]
