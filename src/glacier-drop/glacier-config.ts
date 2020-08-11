import BigNumber from 'bignumber.js'
import {getContractConfigs} from '../config/renderer'
import {DEFAULT_CONTRACT_ADDRESSES} from '../shared/config'
import {ContractConfigItem} from '../config/type'

export const BLOCK_TIME_SECONDS = 43

// FIXME: PM-1968 - when sum of ETC in snapshot is available from contract call (waiting on backend)
export const TOTAL_ETHER_IN_SNAPSHOT = new BigNumber('99987579302527058980101585')

// Contract Addresses
export const loadContractAddresses = (selectedNetwork: string): ContractConfigItem => {
  const contractAddresses = getContractConfigs()

  return selectedNetwork in contractAddresses
    ? contractAddresses[selectedNetwork]
    : DEFAULT_CONTRACT_ADDRESSES
}

// Contract Call Defaults
export const DEFAULT_FEE = '0'
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
  totalAtomToBeDistributed: new BigNumber(1),
  minimumThreshold: new BigNumber(1),
}
