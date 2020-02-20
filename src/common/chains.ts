type ChainId = 'BTC_MAINNET' | 'BTC_TESTNET' | 'ETH_MAINNET' | 'ETH_TESTNET'

export interface Chain {
  id: ChainId
  walletId: number
  symbol: string
  name: string
}

export const CHAINS: Record<ChainId, Chain> = {
  BTC_MAINNET: {
    id: 'BTC_MAINNET',
    walletId: 0,
    symbol: 'BTC',
    name: 'Bitcoin',
  },
  BTC_TESTNET: {
    id: 'BTC_TESTNET',
    walletId: 1,
    symbol: 'BTC',
    name: 'Bitcoin',
  },
  ETH_MAINNET: {
    id: 'ETH_MAINNET',
    walletId: 2,
    symbol: 'ETH',
    name: 'Ethereum',
  },
  ETH_TESTNET: {
    id: 'ETH_TESTNET',
    walletId: 3,
    symbol: 'ETH',
    name: 'Ethereum',
  },
}
