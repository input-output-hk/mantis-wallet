import BigNumber from 'bignumber.js'
import {loadLunaManagedConfig, getContractAddresses} from '../config/renderer'
import {DEFAULT_CONTRACT_ADDRESSES} from '../shared/config'
import {ContractConfigItem} from '../config/type'
import {DisplayChain} from '../pob/chains'
import ethereumLogo from '../assets/icons/chains/ethereum.svg'
import ethereumClippedLogo from '../assets/icons/chains/ethereum-clipped.svg'
import midnightChainLogo from '../assets/icons/chains/dust.svg'

export const ETC_CHAIN: DisplayChain = {
  symbol: 'ETC',
  name: 'Ethereum Classic',
  logo: ethereumLogo,
  clippedLogo: ethereumClippedLogo,
  burnLogo: ethereumClippedLogo,
  unitType: 'Ether',
}

export const MIDNIGHT_CHAIN: DisplayChain = {
  symbol: 'DST',
  name: 'Dust',
  logo: midnightChainLogo,
  clippedLogo: midnightChainLogo,
  burnLogo: midnightChainLogo,
  unitType: 'Dust',
}

export const BLOCK_TIME_SECONDS = 43

// FIXME: PM-1968 - when sum of ETC in snapshot is available from contract call (waiting on backend)
export const TOTAL_ETHER_IN_SNAPSHOT = new BigNumber('99987579302527058980101585')

// Contract Addresses
export const loadCurrentContractAddresses = (): ContractConfigItem => {
  const contractAddresses = getContractAddresses()
  const lunaManagedConfig = loadLunaManagedConfig()

  return lunaManagedConfig.selectedNetwork in contractAddresses
    ? contractAddresses[lunaManagedConfig.selectedNetwork]
    : DEFAULT_CONTRACT_ADDRESSES
}

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
  minimumThreshold: new BigNumber(1),
}
