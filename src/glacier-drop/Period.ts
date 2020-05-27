import BigNumber from 'bignumber.js'
import {PeriodConfig, Claim} from './glacier-state'
import {BLOCK_TIME_SECONDS} from './glacier-config'

export type Period = 'UnlockingNotStarted' | 'Unlocking' | 'UnlockingEnded' | 'Unfreezing'

export const getCurrentEpoch = (
  currentBlock: number,
  {unfreezingStartBlock, epochLength, numberOfEpochs}: PeriodConfig,
): number => {
  if (currentBlock < unfreezingStartBlock) return 0
  return Math.min(
    Math.ceil((currentBlock + 1 - unfreezingStartBlock) / epochLength),
    numberOfEpochs,
  )
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

export const getNumberOfEpochsForClaim = (claim: Claim, periodConfig: PeriodConfig): number =>
  claim.numberOfEpochsForFullUnfreeze || periodConfig.numberOfEpochs

export const getUnfrozenAmount = (
  dustAmount: BigNumber,
  currentEpoch: number,
  numberOfEpochsForClaim: number,
  isUnlocked = true,
): BigNumber => {
  if (!isUnlocked) {
    return new BigNumber(0)
  }

  if (currentEpoch >= numberOfEpochsForClaim) {
    return dustAmount
  }

  return dustAmount.dividedBy(numberOfEpochsForClaim).multipliedBy(currentEpoch)
}
