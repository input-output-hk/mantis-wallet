import React, {ReactNode} from 'react'
import SVG from 'react-inlinesvg'
import BigNumber from 'bignumber.js'
import {CloseOutlined} from '@ant-design/icons'
import {Button, Popover} from 'antd'
import {ETC_CHAIN} from './glacier-config'
import {
  Claim,
  PeriodConfig,
  getUnlockStatus,
  getWithdrawalStatus,
  TransactionStatus,
  isUnlocked,
} from './glacier-state'
import {formatPercentage, toDurationString} from '../common/formatters'
import {returnDataToHumanReadable} from '../common/util'
import {ShortNumber} from '../common/ShortNumber'
import {DUST_SYMBOL} from '../pob/chains'
import {
  getUnfrozenAmount,
  getCurrentEpoch,
  getNumberOfEpochsForClaim,
  getCurrentPeriod,
} from './Period'
import {secondsUntilBlock} from './PeriodStatus'
import checkIcon from '../assets/icons/check.svg'
import refreshIcon from '../assets/icons/refresh.svg'
import exchangeIcon from '../assets/icons/exchange.svg'
import './ClaimRow.scss'

const PROGRESS_ICONS: Record<string, ReactNode> = {
  CHECKED: <SVG src={checkIcon} className="checked icon" />,
  UNKNOWN: <CloseOutlined className="unknown icon" />,
  FAIL: <CloseOutlined className="fail icon" />,
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
      <Popover content={returnDataToHumanReadable(txStatus.returnData)} placement="bottom">
        <span className="fail">Transaction failed</span>
      </Popover>
    )
  } else {
    return <>Transaction successful</>
  }
}

interface PuzzleProgressProps {
  claim: Claim
  currentBlock: number
  periodConfig: PeriodConfig
  onSubmitPuzzle(claim: Claim): void
}

const PuzzleProgress = ({
  claim,
  currentBlock,
  periodConfig,
  onSubmitPuzzle,
}: PuzzleProgressProps): JSX.Element => {
  const period = getCurrentPeriod(currentBlock, periodConfig)

  switch (claim.puzzleStatus) {
    case 'solving': {
      const secondsUntilUnlockingEnds = secondsUntilBlock(
        currentBlock,
        periodConfig.unlockingEndBlock,
      )
      return (
        <>
          <div>Solving Puzzle</div>
          <div>
            <Popover content="Estimation" placement="bottom">
              <span>Total time to unlock:</span>
            </Popover>
            <span className="time-left">{toDurationString(claim.puzzleDuration)}</span>
            {claim.puzzleDuration > secondsUntilUnlockingEnds && (
              <div className="puzzle-warning">
                There may not be enough time to solve the puzzle and unlock eligible funds before
                the unlocking period ends.
              </div>
            )}
          </div>
        </>
      )
    }
    case 'unsubmitted': {
      return (
        <>
          <div className="pow-status">Puzzle Solved</div>
          <div>
            {period === 'Unlocking' ? (
              <Button
                type="primary"
                className="small-button"
                onClick={() => onSubmitPuzzle(claim)}
                disabled={claim.txBuildInProgress}
              >
                Submit Proof of Unlock
              </Button>
            ) : (
              'You can no longer submit your Proof of Unlock.'
            )}
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
              <span>view unlock txn-id</span>
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
  currentEpoch: number
  numberOfEpochsForClaim: number
  showEpochs(): void
  onWithdrawDust(claim: Claim): void
}

const UnfreezeDetail = ({
  claim,
  unfrozenDustAmount,
  currentEpoch,
  numberOfEpochsForClaim,
  showEpochs,
  onWithdrawDust,
}: UnfreezeDetailProps): JSX.Element => {
  const {puzzleStatus, dustAmount, withdrawnDustAmount} = claim

  const isUnfrozen = unfrozenDustAmount.isGreaterThan(0) && isUnlocked(claim)

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
    const epochsRemaining = numberOfEpochsForClaim - currentEpoch

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
          disabled={cannotWithdrawMore || claim.txBuildInProgress}
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
          <span>view latest withdrawal txn-id</span>
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

  const unlocked = isUnlocked(claim)
  const currentEpoch = getCurrentEpoch(currentBlock, periodConfig)
  const numberOfEpochsForClaim = getNumberOfEpochsForClaim(claim, periodConfig)
  const unfrozenDustAmount = getUnfrozenAmount(
    dustAmount,
    currentEpoch,
    numberOfEpochsForClaim,
    unlocked,
  )
  const unlockedDustAmount = unlocked ? dustAmount : new BigNumber(0)

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
            <span>
              {ETC_CHAIN.symbol} Address: {externalAddress}
            </span>
          </Popover>
        </div>
        <div className="midnight-address">
          <Popover content={transparentAddress} placement="bottom">
            <span>Transparent Midnight Address: {transparentAddress}</span>
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
            <PuzzleProgress
              claim={claim}
              periodConfig={periodConfig}
              currentBlock={currentBlock}
              onSubmitPuzzle={onSubmitPuzzle}
            />
          </div>
        </div>
        <div className="unfrozen detail">
          <UnfreezeDetail
            claim={claim}
            unfrozenDustAmount={unfrozenDustAmount}
            numberOfEpochsForClaim={numberOfEpochsForClaim}
            currentEpoch={getCurrentEpoch(currentBlock, periodConfig)}
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
