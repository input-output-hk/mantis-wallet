import React, {ReactNode} from 'react'
import SVG from 'react-inlinesvg'
import BigNumber from 'bignumber.js'
import {toAscii} from 'web3/lib/utils/utils.js'
import {Icon, Button, Popover} from 'antd'
import {ETC_CHAIN} from './glacier-config'
import {
  Claim,
  PeriodConfig,
  getUnlockStatus,
  getWithdrawalStatus,
  TransactionStatus,
} from './glacier-state'
import {formatPercentage, toDurationString} from '../common/formatters'
import {ShortNumber} from '../common/ShortNumber'
import {DUST_SYMBOL} from '../pob/chains'
import {getUnfrozenAmount, getCurrentEpoch, getUnlockedAmount} from './Period'
import checkIcon from '../assets/icons/check.svg'
import refreshIcon from '../assets/icons/refresh.svg'
import exchangeIcon from '../assets/icons/exchange.svg'
import './ClaimRow.scss'

const PROGRESS_ICONS: Record<string, ReactNode> = {
  CHECKED: <SVG src={checkIcon} className="checked icon" />,
  UNKNOWN: <Icon type="close" className="unknown icon" />,
  FAIL: <Icon type="close" className="fail icon" />,
  IN_PROGRESS: <SVG src={refreshIcon} className="in-progress icon" />,
}

interface TxStatusTextProps {
  txStatus: TransactionStatus | null
}

const TxStatusText = ({txStatus}: TxStatusTextProps): JSX.Element => {
  if (!txStatus) {
    return <></>
  } else if (txStatus.status === 'TransactionPending') {
    return <>Transaction is pending</>
  } else if (txStatus.status === 'TransactionFailed') {
    return (
      <Popover content={toAscii(txStatus.returnData)} placement="bottom">
        <span className="fail">Transaction failed</span>
      </Popover>
    )
  } else {
    return <>Transaction successful</>
  }
}

interface PuzzleProgressProps {
  claim: Claim
  onSubmitPuzzle(claim: Claim): void
}

const PuzzleProgress = ({claim, onSubmitPuzzle}: PuzzleProgressProps): JSX.Element => {
  switch (claim.puzzleStatus) {
    case 'solving': {
      return (
        <>
          <div>Solving Puzzle</div>
          <div>
            <Popover content="Estimation" placement="bottom">
              Total time to unlock:
            </Popover>
            <span className="time-left">{toDurationString(claim.puzzleDuration)}</span>
          </div>
        </>
      )
    }
    case 'unsubmitted': {
      return (
        <>
          <div className="pow-status">Puzzle Solved</div>
          <div>
            <Button type="primary" className="small-button" onClick={() => onSubmitPuzzle(claim)}>
              Submit Proof of Unlock
            </Button>
          </div>
        </>
      )
    }
    case 'submitted': {
      return (
        <>
          <div className="tx-status">
            <TxStatusText txStatus={getUnlockStatus(claim)} />
          </div>
          <div className="pow-status">PoW Puzzle Submitted</div>
          <div className="action-link">
            <Popover content={claim.unlockTxHash} placement="bottom">
              view unlock txn-id
            </Popover>
          </div>
        </>
      )
    }
  }
}

interface UnfreezeDetailProps {
  claim: Claim
  unfrozenDustAmount: BigNumber
  epochsRemaining: number
  showEpochs(): void
  onWithdrawDust(claim: Claim): void
}

const UnfreezeDetail = ({
  claim,
  unfrozenDustAmount,
  epochsRemaining,
  showEpochs,
  onWithdrawDust,
}: UnfreezeDetailProps): JSX.Element => {
  const {puzzleStatus, dustAmount, withdrawnDustAmount} = claim

  const isUnfrozen =
    unfrozenDustAmount.isGreaterThan(0) && getUnlockStatus(claim)?.status === 'TransactionOk'

  if (puzzleStatus === 'solving' || !isUnfrozen) {
    return <div>0%</div>
  }
  if (unfrozenDustAmount.isZero()) {
    return (
      <>
        <div>
          0%
          <span className="amount">
            0 / <ShortNumber big={dustAmount} /> {DUST_SYMBOL}
          </span>
        </div>
      </>
    )
  } else {
    const cannotWithdrawMore = withdrawnDustAmount.isGreaterThanOrEqualTo(unfrozenDustAmount)
    return (
      <>
        <div>
          {formatPercentage(unfrozenDustAmount.dividedBy(dustAmount))}%
          <span className="amount">
            <ShortNumber big={unfrozenDustAmount} /> / <ShortNumber big={dustAmount} />{' '}
            {DUST_SYMBOL}
          </span>
        </div>
        {epochsRemaining > 0 && (
          <div className="action-link">{epochsRemaining} epochs until full unfreeze</div>
        )}
        <Button
          type="primary"
          className="small-button"
          onClick={() => onWithdrawDust(claim)}
          disabled={cannotWithdrawMore}
        >
          Withdraw Available Dust
        </Button>
        <div className="action-link" onClick={showEpochs}>
          view unfreezing progress
        </div>
      </>
    )
  }
}

interface WithdrawDetailProps {
  claim: Claim
}

const WithdrawDetail = ({claim}: WithdrawDetailProps): JSX.Element => {
  const {withdrawnDustAmount, dustAmount, withdrawTxHashes} = claim
  if (withdrawnDustAmount.isZero() || claim.puzzleStatus !== 'submitted') {
    return <div className="withdraw-progress">0%</div>
  }
  return (
    <>
      <div className="withdraw-progress">
        {formatPercentage(withdrawnDustAmount.dividedBy(dustAmount))}%
        <span className="amount">
          <ShortNumber big={withdrawnDustAmount} /> / <ShortNumber big={dustAmount} /> {DUST_SYMBOL}
        </span>
      </div>
      <div className="tx-status">
        <TxStatusText txStatus={getWithdrawalStatus(claim)} />
      </div>
      <div className="action-link">
        <Popover content={withdrawTxHashes[withdrawTxHashes.length - 1]} placement="bottom">
          view latest withdrawal txn-id
        </Popover>
      </div>
    </>
  )
}

const getUnlockedIcon = (claim: Claim): React.ReactNode => {
  const unlockStatus = getUnlockStatus(claim)
  if (
    claim.puzzleStatus === 'solving' ||
    claim.puzzleStatus === 'unsubmitted' ||
    unlockStatus?.status === 'TransactionPending'
  ) {
    return PROGRESS_ICONS.IN_PROGRESS
  } else if (unlockStatus?.status === 'TransactionFailed') {
    return PROGRESS_ICONS.FAIL
  } else {
    return PROGRESS_ICONS.CHECKED
  }
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
  currentBlock: number
  periodConfig: PeriodConfig
  showEpochs(): void
  onSubmitPuzzle(claim: Claim): void
  onWithdrawDust(claim: Claim): void
}

export const ClaimRow = ({
  claim,
  index,
  currentBlock,
  periodConfig,
  showEpochs,
  onSubmitPuzzle,
  onWithdrawDust,
}: ClaimRowProps): JSX.Element => {
  const {
    dustAmount,
    externalAmount,
    transparentAddress,
    externalAddress,
    withdrawnDustAmount,
  } = claim
  const unlockStatus = getUnlockStatus(claim)
  const unfrozenDustAmount = getUnfrozenAmount(currentBlock, periodConfig, unlockStatus, dustAmount)
  const unlockedDustAmount = getUnlockedAmount(unlockStatus, dustAmount)
  const currentEpoch = getCurrentEpoch(currentBlock, periodConfig)
  const epochsRemaining = periodConfig.numberOfEpochs - currentEpoch

  return (
    <div className="ClaimRow">
      <div className="header">
        <div className="claim-title">Claim #{index}</div>
        <div className="exchange">
          <ShortNumber big={externalAmount} unit={ETC_CHAIN.unitType} /> {ETC_CHAIN.symbol}
          <SVG src={exchangeIcon} className="icon" />
          <ShortNumber big={dustAmount} /> {DUST_SYMBOL}
        </div>
        <div className="external-address">
          <Popover content={externalAddress} placement="bottom">
            {ETC_CHAIN.symbol} Address: {externalAddress}
          </Popover>
        </div>
        <div className="midnight-address">
          <Popover content={transparentAddress} placement="bottom">
            Transparent Midnight Address: {transparentAddress}
          </Popover>
        </div>
      </div>
      <div className="status">
        <div className="progress">{PROGRESS_ICONS.CHECKED} Claimed</div>
        <div className="line"></div>
        <div className="progress">{getUnlockedIcon(claim)} Unlocked</div>
        <div className="line"></div>
        <div className="progress">
          {getNumericalProgressIcon(unfrozenDustAmount, dustAmount)} Unfrozen
        </div>
        <div className="line"></div>
        <div className="progress">
          {getNumericalProgressIcon(withdrawnDustAmount, dustAmount)} Withdrawn
        </div>

        <div className="claimed detail">
          <div>
            <ShortNumber big={dustAmount} /> {DUST_SYMBOL}
          </div>
        </div>
        <div className="unlocked detail">
          <div>
            <ShortNumber big={unlockedDustAmount} /> {DUST_SYMBOL}
          </div>
          <div className="puzzle-progress">
            <PuzzleProgress claim={claim} onSubmitPuzzle={onSubmitPuzzle} />
          </div>
        </div>
        <div className="unfrozen detail">
          <UnfreezeDetail
            claim={claim}
            unfrozenDustAmount={unfrozenDustAmount}
            epochsRemaining={epochsRemaining}
            showEpochs={showEpochs}
            onWithdrawDust={onWithdrawDust}
          />
        </div>
        <div className="withdrawn detail">
          <WithdrawDetail claim={claim} />
        </div>
      </div>
    </div>
  )
}
