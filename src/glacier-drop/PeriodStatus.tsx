import React from 'react'
import SVG from 'react-inlinesvg'
import _ from 'lodash/fp'
import {BLOCK_TIME_SECONDS} from './glacier-config'
import {PeriodConfig} from './glacier-state'
import {toDurationString} from '../common/formatters'
import clockIcon from '../assets/icons/clock.svg'
import hourglassIcon from '../assets/icons/hourglass.svg'
import {Period, getCurrentPeriod} from './Period'
import './PeriodStatus.scss'

export const secondsUntilBlock = (currentBlock: number, block: number): number =>
  (block - currentBlock) * BLOCK_TIME_SECONDS

const timeUntilBlock = (currentBlock: number, block: number): string =>
  toDurationString(secondsUntilBlock(currentBlock, block))

const getCurrentPeriodText = (period: Period): string => {
  switch (period) {
    case 'UnlockingNotStarted':
      return 'Unlocking not yet started'
    case 'Unlocking':
      return 'Unlocking Period in Progress'
    case 'UnlockingEnded':
      return 'Unlocking Period Ended'
    case 'Unfreezing':
      return 'Unfreezing Period in Progress'
  }
}

const getCurrentPeriodDetailText = (
  currentBlock: number,
  periodConfig: PeriodConfig,
  period: Period,
): string => {
  const {unlockingStartBlock, unlockingEndBlock, unfreezingStartBlock} = periodConfig

  const t = (block: number): string => _.capitalize(timeUntilBlock(currentBlock, block))

  switch (period) {
    case 'UnlockingNotStarted':
      return `${t(unlockingStartBlock)} until Unlocking starts`
    case 'Unlocking':
      return `${t(unlockingEndBlock)} left to unlock Dust`
    case 'UnlockingEnded':
      return `${t(unfreezingStartBlock)} until Unfreezing`
    default:
      return ''
  }
}

const NextPeriodDetail = ({
  currentBlock,
  periodConfig,
  period,
}: {
  currentBlock: number
  periodConfig: PeriodConfig
  period: Period
}): JSX.Element => {
  if (period === 'Unlocking') {
    const {unfreezingStartBlock} = periodConfig
    return (
      <div className="next-period">
        <div className="next-period-detail">
          <SVG src={hourglassIcon} className="icon hourglass" />
          Unfreezing Period starts in {timeUntilBlock(currentBlock, unfreezingStartBlock)}
        </div>
      </div>
    )
  } else {
    return <></>
  }
}

interface PuzzleInfoProps {
  currentBlock: number
  periodConfig: PeriodConfig
}

const PuzzleInfo = ({
  currentBlock,
  periodConfig: {unlockingEndBlock},
}: PuzzleInfoProps): JSX.Element => {
  const timeLeft = timeUntilBlock(currentBlock, unlockingEndBlock)
  return (
    <div className="puzzle-info">
      <div className="title">PoW Puzzle Complete</div>
      <div>You have {timeLeft} to submit your Unlocked Proof for Glacier Drop</div>
    </div>
  )
}

interface PeriodStatusProps {
  currentBlock: number
  periodConfig: PeriodConfig
  powPuzzleComplete: boolean
}

export const PeriodStatus = ({
  currentBlock,
  periodConfig,
  powPuzzleComplete,
}: PeriodStatusProps): JSX.Element => {
  const period = getCurrentPeriod(currentBlock, periodConfig)
  const currentPeriodDetailText = getCurrentPeriodDetailText(currentBlock, periodConfig, period)

  return (
    <div className="PeriodStatus">
      <div className="period-info">
        <div className="current-period">
          <div className="current-period-title">
            <SVG src={clockIcon} className="icon" />
            {getCurrentPeriodText(period)}
          </div>
          {currentPeriodDetailText && (
            <div className="current-period-detail">{currentPeriodDetailText}</div>
          )}
        </div>
        <NextPeriodDetail currentBlock={currentBlock} periodConfig={periodConfig} period={period} />
      </div>
      {powPuzzleComplete && period === 'Unlocking' && (
        <PuzzleInfo currentBlock={currentBlock} periodConfig={periodConfig} />
      )}
    </div>
  )
}
