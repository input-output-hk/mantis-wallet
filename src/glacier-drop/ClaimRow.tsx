import React, {ReactNode} from 'react'
import SVG from 'react-inlinesvg'
import {Icon, Button} from 'antd'
import formatDistance from 'date-fns/formatDistance'
import BigNumber from 'bignumber.js'
import {formatPercentage} from '../common/formatters'
import {bigToNumber} from '../common/util'
import {ShortNumber} from '../common/ShortNumber'
import {Claim} from './GlacierDropOverview'
import checkIcon from '../assets/icons/check.svg'
import refreshIcon from '../assets/icons/refresh.svg'
import exchangeIcon from '../assets/icons/exchange.svg'
import './ClaimRow.scss'

const PROGRESS_ICONS: Record<string, ReactNode> = {
  CHECKED: <SVG src={checkIcon} className="checked icon" />,
  UNKNOWN: <Icon type="close" className="unknown icon" />,
  IN_PROGRESS: <SVG src={refreshIcon} className="in-progress icon" />,
}

const EPOCHS_REMAINING = 7

const toDurationString = (seconds: number): string =>
  formatDistance(0, seconds * 1000, {includeSeconds: true})

interface PuzzleProgressProps {
  claim: Claim
  onSubmitPuzzle(): void
}

const PuzzleProgress = ({claim, onSubmitPuzzle}: PuzzleProgressProps): JSX.Element => {
  switch (claim.puzzleStatus) {
    case 'solving': {
      return (
        <>
          <div>Solving Puzzle</div>
          <div>
            Estimated time left:
            <span className="time-left">{toDurationString(claim.remainingSeconds)}</span>
          </div>
        </>
      )
    }
    case 'unsubmitted':
    case 'submitted': {
      const isDisabled = claim.puzzleStatus === 'submitted'
      return (
        <>
          <div className="solved">Puzzle Solved</div>
          <div>
            <Button
              type="primary"
              className="small-button"
              onClick={onSubmitPuzzle}
              disabled={isDisabled}
            >
              Submit Proof of Unlock
            </Button>
          </div>
        </>
      )
    }
  }
}

interface UnfreezeDetailProps {
  claim: Claim
  onWithdrawDust(): void
}

const UnfreezeDetail = ({claim, onWithdrawDust}: UnfreezeDetailProps): JSX.Element => {
  const {puzzleStatus, unfrozen, unfrozenDustAmount, dustAmount} = claim
  if (puzzleStatus === 'solving' || !unfrozen) {
    return <div>0%</div>
  }
  if (bigToNumber(unfrozenDustAmount) === 0) {
    return (
      <>
        <div>
          0%
          <span className="amount">
            0 / <ShortNumber big={dustAmount} /> DT
          </span>
        </div>
        <div className="action-link">view unfreeze txn-id</div>
      </>
    )
  }
  return (
    <>
      <div>
        {formatPercentage(unfrozenDustAmount.dividedBy(dustAmount))}%
        <span className="amount">
          <ShortNumber big={unfrozenDustAmount} /> / <ShortNumber big={dustAmount} /> DT
        </span>
      </div>
      <div className="action-link">{EPOCHS_REMAINING} epochs until full unfreeze</div>
      <div className="action-link">view unfreeze txn-id</div>
      <Button type="primary" className="small-button" onClick={onWithdrawDust}>
        Withdraw Available Dust
      </Button>
      <div className="action-link">view unfreezing progress</div>
    </>
  )
}

interface WithdrawDetailProps {
  claim: Claim
}

const WithdrawDetail = ({claim}: WithdrawDetailProps): JSX.Element => {
  const {withdrawnDustAmount, dustAmount} = claim
  if (bigToNumber(withdrawnDustAmount) === 0) {
    return <div className="withdraw-progress">0%</div>
  }
  return (
    <>
      <div className="withdraw-progress">
        {formatPercentage(withdrawnDustAmount.dividedBy(dustAmount))}%
        <span className="amount">
          <ShortNumber big={withdrawnDustAmount} /> / <ShortNumber big={dustAmount} /> DT
        </span>
      </div>
      <div className="action-link">view withdrawal txn-id</div>
    </>
  )
}

const getUnlockedIcon = (claim: Claim): React.ReactNode => {
  return claim.puzzleStatus === 'solving' ? PROGRESS_ICONS.IN_PROGRESS : PROGRESS_ICONS.CHECKED
}

const getNumericalProgressIcon = (
  currentAmount: BigNumber,
  maxAmount: BigNumber,
): React.ReactNode => {
  if (currentAmount.isEqualTo(0)) return PROGRESS_ICONS.UNKNOWN
  if (currentAmount.isEqualTo(maxAmount)) return PROGRESS_ICONS.CHECKED
  return PROGRESS_ICONS.IN_PROGRESS
}

interface ClaimRowProps {
  claim: Claim
  index: number
  onSubmitPuzzle(): void
  onWithdrawDust(): void
}

export const ClaimRow = ({
  claim,
  index,
  onSubmitPuzzle,
  onWithdrawDust,
}: ClaimRowProps): JSX.Element => {
  return (
    <div className="ClaimRow">
      <div className="header">
        <div className="claim-title">Claim #{index}</div>
        <div className="exchange">
          <ShortNumber big={claim.externalAmount} unit={claim.chain.unitType} />{' '}
          {claim.chain.symbol}
          <SVG src={exchangeIcon} className="icon" />
          <ShortNumber big={claim.dustAmount} /> DT
        </div>
        <div className="external-address">
          {claim.chain.symbol} Address: {claim.externalAddress}
        </div>
        <div className="midnight-address">
          Transparent Midnight Address: {claim.midnightAddress}
        </div>
      </div>
      <div className="status">
        <div className="progress">{PROGRESS_ICONS.CHECKED} Claimed</div>
        <div className="line"></div>
        <div className="progress">{getUnlockedIcon(claim)} Unlocked</div>
        <div className="line"></div>
        <div className="progress">
          {getNumericalProgressIcon(claim.unfrozenDustAmount, claim.dustAmount)} Unfrozen
        </div>
        <div className="line"></div>
        <div className="progress">
          {getNumericalProgressIcon(claim.withdrawnDustAmount, claim.dustAmount)} Withdrawn
        </div>

        <div className="claimed detail">
          <div>
            <ShortNumber big={claim.dustAmount} /> DT
          </div>
        </div>
        <div className="unlocked detail">
          <div>
            <ShortNumber big={claim.dustAmount} /> DT
          </div>
          <div className="puzzle-progress">
            <PuzzleProgress claim={claim} onSubmitPuzzle={onSubmitPuzzle} />
          </div>
        </div>
        <div className="unfrozen detail">
          <UnfreezeDetail claim={claim} onWithdrawDust={onWithdrawDust} />
        </div>
        <div className="withdrawn detail">
          <WithdrawDetail claim={claim} />
        </div>
      </div>
    </div>
  )
}
