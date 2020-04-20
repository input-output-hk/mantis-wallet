import BigNumber from 'bignumber.js'
import {PeriodConfig, TransactionStatus} from './glacier-state'
import {BLOCK_TIME_SECONDS} from './glacier-config'

export type Period = 'UnlockingNotStarted' | 'Unlocking' | 'UnlockingEnded' | 'Unfreezing'

export const getCurrentEpoch = (
  currentBlock: number,
  {unfreezingStartBlock, epochLength, numberOfEpochs}: PeriodConfig,
): number => {
  if (currentBlock < unfreezingStartBlock) return 0
  return Math.min(Math.ceil((currentBlock - unfreezingStartBlock) / epochLength), numberOfEpochs)
}

export const getSecondsUntilNextEpoch = (
  currentBlock: number,
  {unfreezingStartBlock, epochLength}: PeriodConfig,
  currentEpoch: number,
): number =>
  (unfreezingStartBlock + (epochLength * currentEpoch + 1) - currentBlock) * BLOCK_TIME_SECONDS

export const getCurrentPeriod = (
  currentBlock: number,
  {unlockingStartBlock, unlockingEndBlock, unfreezingStartBlock}: PeriodConfig,
): Period => {
  if (currentBlock < unlockingStartBlock) {
    return 'UnlockingNotStarted'
  } else if (currentBlock < unlockingEndBlock) {
    return 'Unlocking'
  } else if (currentBlock < unfreezingStartBlock) {
    return 'UnlockingEnded'
  } else {
    return 'Unfreezing'
  }
}

export const getUnfrozenAmount = (
  currentBlock: number,
  periodConfig: PeriodConfig,
  unlockStatus: TransactionStatus | null,
  dustAmount: BigNumber,
): BigNumber => {
  return unlockStatus?.status === 'TransactionOk'
    ? dustAmount
        .dividedBy(periodConfig.numberOfEpochs)
        .multipliedBy(getCurrentEpoch(currentBlock, periodConfig))
    : new BigNumber(0)
}

export const getUnlockedAmount = (
  unlockStatus: TransactionStatus | null,
  dustAmount: BigNumber,
): BigNumber => (unlockStatus?.status === 'TransactionOk' ? dustAmount : new BigNumber(0))
