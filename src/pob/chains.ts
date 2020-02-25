export type ChainId = 'BTC_MAINNET' | 'BTC_TESTNET' | 'ETH_MAINNET' | 'ETH_TESTNET'

export interface Chain {
  id: ChainId
  numericId: number
  symbol: string
  name: string
}

export const CHAINS: Chain[] = [
  {
    id: 'BTC_MAINNET',
    numericId: 0,
    symbol: 'BTC',
    name: 'Bitcoin',
  },
  {
    id: 'BTC_TESTNET',
    numericId: 1,
    symbol: 'BTC',
    name: 'Bitcoin',
  },
  {
    id: 'ETH_MAINNET',
    numericId: 2,
    symbol: 'ETH',
    name: 'Ethereum',
  },
  {
    id: 'ETH_TESTNET',
    numericId: 3,
    symbol: 'ETH',
    name: 'Ethereum',
  },
]
