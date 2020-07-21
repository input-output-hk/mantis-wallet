import React from 'react'
import SVG from 'react-inlinesvg'
import BigNumber from 'bignumber.js'
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
import {returnDataToHumanReadable, fillActionHandlers} from '../common/util'
import {ShortNumber} from '../common/ShortNumber'
import {ProgressState, PROGRESS_ICONS} from '../common/ProgressBar'
import {DUST_SYMBOL} from '../pob/chains'
import {
  getUnfrozenAmount,
  getCurrentEpoch,
  getNumberOfEpochsForClaim,
  getCurrentPeriod,
  Period,
} from './Period'
import {secondsUntilBlock} from './PeriodStatus'
import {useFormatters} from '../settings-state'
import exchangeIcon from '../assets/icons/exchange.svg'
import './ClaimRow.scss'

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
  const {toDurationString} = useFormatters()
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
              <span className="puzzle-warning">You can no longer submit your Proof of Unlock.</span>
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
  const {formatPercentage} = useFormatters()

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
        <div className="action-link" {...fillActionHandlers(showEpochs)}>
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
  const {formatPercentage} = useFormatters()
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

const getUnlockProgressState = (claim: Claim, period: Period): ProgressState => {
  const unlockStatus = getUnlockStatus(claim)
  if (
    unlockStatus?.status === 'TransactionFailed' ||
    (claim.puzzleStatus === 'unsubmitted' && period !== 'Unlocking')
  ) {
    return 'fail'
  } else if (
    claim.puzzleStatus === 'solving' ||
    claim.puzzleStatus === 'unsubmitted' ||
    unlockStatus?.status === 'TransactionPending'
  ) {
    return 'inProgress'
  } else {
    return 'checked'
  }
}

const getNumericalProgressState = (
  currentAmount: BigNumber,
  maxAmount: BigNumber,
): ProgressState => {
  if (currentAmount.isEqualTo(0)) return 'unknown'
  if (currentAmount.isEqualTo(maxAmount)) return 'checked'
  return 'inProgress'
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
  const period = getCurrentPeriod(currentBlock, periodConfig)

  // Progress
  const unlockProgress = getUnlockProgressState(claim, period)
  const unfreezeProgress = getNumericalProgressState(unfrozenDustAmount, dustAmount)
  const withdrawProgress = getNumericalProgressState(withdrawnDustAmount, dustAmount)

  return (
    <div className="ClaimRow">
      <div className="header">
        <div className="claim-title">Claim #{index + 1}</div>
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
        <div className="progress">
          {PROGRESS_ICONS.checked} <span className="checked">Claimed</span>
        </div>
        <div className="line"></div>
        <div className="progress">
          {PROGRESS_ICONS[unlockProgress]} <span className={unlockProgress}>Unlocked</span>
        </div>
        <div className="line"></div>
        <div className="progress">
          {PROGRESS_ICONS[unfreezeProgress]} <span className={unfreezeProgress}>Unfrozen</span>
        </div>
        <div className="line"></div>
        <div className="progress">
          {PROGRESS_ICONS[withdrawProgress]} <span className={withdrawProgress}>Withdrawn</span>
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
