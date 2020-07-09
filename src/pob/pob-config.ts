import {Chain, CHAINS, ChainId} from './chains'

export const PROVER_API_REQUEST_TIMEOUT = 10000

export const PROVER_POLLING_RATE = 2000

export const CHAINS_TO_USE_IN_POB: Chain[] = [CHAINS.BTC_TESTNET, CHAINS.ETH_TESTNET]

export const AUTO_DUST_CONVERSION = false

/**
 * In the end of the tx_found there is a lag to switch to next state
 * Let's wait for a few more blocks, so the progress bar doesn't look like
 * it is stuck at the end.
 */
export const NUMBER_OF_BLOCKS_AFTER_TX_FOUND = 25

export const NUMBER_OF_BLOCKS_TO_SUCCESS = 10
export const NUMBER_OF_BLOCKS_TO_CONFIRM = 4

export const MIDNIGHT_TOKEN_CONTRACTS: Record<ChainId, string> = {
  BTC_MAINNET: 'm-test-uns-ad1qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqey26sy3',
  BTC_TESTNET: 'm-test-uns-ad1qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq62e0x2w',
  ETH_MAINNET: 'm-test-uns-ad1qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqmh0mnhu',
  ETH_TESTNET: 'm-test-uns-ad1qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqukkvrke',
} as const
