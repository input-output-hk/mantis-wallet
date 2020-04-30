import BigNumber from 'bignumber.js'
import ethereumLogo from '../assets/icons/chains/ethereum.svg'
import ethereumClippedLogo from '../assets/icons/chains/ethereum-clipped.svg'
import ethereumBurnLogo from '../assets/icons/chains/m-eth.svg'
import {DisplayChain} from '../pob/chains'

export const ETC_CHAIN: DisplayChain = {
  symbol: 'ETC',
  name: 'Ethereum Classic',
  logo: ethereumLogo,
  clippedLogo: ethereumClippedLogo,
  burnLogo: ethereumBurnLogo,
  unitType: 'Ether',
}

export const BLOCK_TIME_SECONDS = 3.9 * 60
// FIXME: when sum of ETC in snapshot is available from contract call (waiting on backend)
export const TOTAL_ETHER_IN_SNAPSHOT = new BigNumber('99987579302527058980101585')

// Contract Addresses
export const GLACIER_DROP_ADDRESS = 'm-test-uns-ad1qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq79ndq95'
export const CONSTANTS_REPO_ADDRESS = 'm-test-uns-ad1qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq5gzg0gy'

// Contract Call Defaults
export const DEFAULT_GAS_PRICE = '0'
export const DEFAULT_GAS_LIMIT = '1185920'
