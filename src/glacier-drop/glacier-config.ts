import BigNumber from 'bignumber.js'
import {loadLunaManagedConfig, getContractAddresses} from '../config/renderer'
import {DisplayChain} from '../pob/chains'
import ethereumLogo from '../assets/icons/chains/ethereum.svg'
import ethereumClippedLogo from '../assets/icons/chains/ethereum-clipped.svg'
import ethereumBurnLogo from '../assets/icons/chains/m-eth.svg'

export const ETC_CHAIN: DisplayChain = {
  symbol: 'ETC',
  name: 'Ethereum Classic',
  logo: ethereumLogo,
  clippedLogo: ethereumClippedLogo,
  burnLogo: ethereumBurnLogo,
  unitType: 'Ether',
}

export const BLOCK_TIME_SECONDS = 3.9 * 60
// FIXME: PM-1968 - when sum of ETC in snapshot is available from contract call (waiting on backend)
export const TOTAL_ETHER_IN_SNAPSHOT = new BigNumber('99987579302527058980101585')

// Contract Addresses
const contractAddresses = getContractAddresses()
const lunaManagedConfig = loadLunaManagedConfig()
const addressConfig =
  lunaManagedConfig.selectedNetwork in contractAddresses
    ? contractAddresses[lunaManagedConfig.selectedNetwork]
    : {
        glacierDrop: 'm-test-uns-ad1qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq79ndq95',
        constantsRepo: 'm-test-uns-ad1qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq5gzg0gy',
      }
export const GLACIER_DROP_ADDRESS = addressConfig.glacierDrop
export const CONSTANTS_REPO_ADDRESS = addressConfig.constantsRepo

// Contract Call Defaults
export const DEFAULT_GAS_PRICE = '0'
export const DEFAULT_GAS_LIMIT = '1185920'

// UI config
export const MINING_STATUS_CHECK_INTERVAL = 2000

// Mock
export const DEFAULT_GLACIER_CONSTANTS = {
  periodConfig: {
    unlockingStartBlock: 1,
    unlockingEndBlock: 2,
    unfreezingStartBlock: 3,
    epochLength: 1,
    numberOfEpochs: 1,
  },
  totalDustDistributed: new BigNumber(1),
}
