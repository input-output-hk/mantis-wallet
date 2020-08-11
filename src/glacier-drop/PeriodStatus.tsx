import React from 'react'
import SVG from 'react-inlinesvg'
import {BLOCK_TIME_SECONDS} from './glacier-config'
import {PeriodConfig} from './glacier-state'
import {useFormatters, useTranslation} from '../settings-state'
import clockIcon from '../assets/icons/clock.svg'
import hourglassIcon from '../assets/icons/hourglass.svg'
import {Period, getCurrentPeriod} from './Period'
import {TKeyRenderer} from '../common/i18n'
import {Trans} from '../common/Trans'
import './PeriodStatus.scss'

export const secondsUntilBlock = (currentBlock: number, block: number): number =>
  (block - currentBlock) * BLOCK_TIME_SECONDS

const timeUntilBlock = (currentBlock: number, block: number): string =>
  useFormatters().toDurationString(secondsUntilBlock(currentBlock, block))

const getCurrentPeriodText = (period: Period): TKeyRenderer => {
  switch (period) {
    case 'UnlockingNotStarted':
      return ['glacierDrop', 'periodStatus', 'unlockingNotStarted']
    case 'Unlocking':
      return ['glacierDrop', 'periodStatus', 'unlocking']
    case 'UnlockingEnded':
      return ['glacierDrop', 'periodStatus', 'unlockingEnded']
    case 'Unfreezing':
      return ['glacierDrop', 'periodStatus', 'unfreezing']
  }
}

const getCurrentPeriodDetailText = (
  currentBlock: number,
  periodConfig: PeriodConfig,
  period: Period,
): string => {
  const {unlockingStartBlock, unlockingEndBlock, unfreezingStartBlock} = periodConfig
  const {t} = useTranslation()

  const timeUntil = (block: number): string => timeUntilBlock(currentBlock, block)

  switch (period) {
    case 'UnlockingNotStarted':
      return t(['glacierDrop', 'periodStatus', 'timeUntilUnlockingStarts'], {
        replace: {duration: timeUntil(unlockingStartBlock)},
      })
    case 'Unlocking':
      return t(['glacierDrop', 'periodStatus', 'timeLeftToUnlockDust'], {
        replace: {duration: timeUntil(unlockingEndBlock)},
      })
    case 'UnlockingEnded':
      return t(['glacierDrop', 'periodStatus', 'timeUntilUnfreezing'], {
        replace: {duration: timeUntil(unfreezingStartBlock)},
      })
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
          <Trans
            k={['glacierDrop', 'periodStatus', 'unfreezingPeriodStartsIn']}
            values={{duration: timeUntilBlock(currentBlock, unfreezingStartBlock)}}
          />
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
      <div className="title">
        <Trans k={['glacierDrop', 'message', 'powPuzzleComplete']} />
      </div>
      <div>
        <Trans
          k={['glacierDrop', 'message', 'youHaveTimeLeftToSubmitYourProof']}
          values={{timeLeft}}
        />
      </div>
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
            <Trans k={getCurrentPeriodText(period)} />
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
