import React from 'react'
import SVG from 'react-inlinesvg'
import BigNumber from 'bignumber.js'
import {Button, Popover} from 'antd'
import {ETC_CHAIN, DST_CHAIN} from '../common/chains'
import {
  Claim,
  PeriodConfig,
  getUnlockStatus,
  getWithdrawalStatus,
  isUnlocked,
} from './glacier-state'
import {TransactionStatus, CallTxStatuses} from '../common/wallet-state'
import {fillActionHandlers} from '../common/util'
import {ShortNumber} from '../common/ShortNumber'
import {ProgressState, ProgressIcon} from '../common/ProgressBar'
import {
  getUnfrozenAmount,
  getCurrentEpoch,
  getNumberOfEpochsForClaim,
  getCurrentPeriod,
  Period,
} from './Period'
import {secondsUntilBlock} from './PeriodStatus'
import {useFormatters} from '../settings-state'
import {Trans} from '../common/Trans'
import exchangeIcon from '../assets/icons/exchange.svg'
import './ClaimRow.scss'

interface TxStatusTextProps {
  txStatus: TransactionStatus | null
}

const TxStatusText = ({txStatus}: TxStatusTextProps): JSX.Element => {
  if (!txStatus) {
    return <></>
  } else if (txStatus.status === 'TransactionPending') {
    return <Trans k={['glacierDrop', 'transactionStatus', 'pending']} />
  } else if (txStatus.status === 'TransactionFailed') {
    return (
      <Popover content={txStatus.message} placement="bottom">
        <span className="fail">
          <Trans k={['glacierDrop', 'transactionStatus', 'failed']} />
        </span>
      </Popover>
    )
  } else {
    return <Trans k={['glacierDrop', 'transactionStatus', 'successful']} />
  }
}

interface PuzzleProgressProps {
  claim: Claim
  currentBlock: number
  periodConfig: PeriodConfig
  unlockStatus: TransactionStatus | null
  onSubmitPuzzle(claim: Claim): void
  onRemoveClaim(claim: Claim): void
}

const PuzzleProgress = ({
  claim,
  currentBlock,
  periodConfig,
  unlockStatus,
  onSubmitPuzzle,
  onRemoveClaim,
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
          <div>
            <Trans k={['glacierDrop', 'powStatus', 'solvingPuzzle']} />
          </div>
          <div>
            <Popover content="Estimation" placement="bottom">
              <span>
                <Trans k={['glacierDrop', 'label', 'totalTimeToUnlockFunds']} />:
              </span>
            </Popover>
            <span className="time-left">{toDurationString(claim.puzzleDuration)}</span>
            {claim.puzzleDuration > secondsUntilUnlockingEnds && (
              <div className="puzzle-warning">
                <Trans k={['glacierDrop', 'message', 'notEnoughTimeForPuzzleWarning']} />
              </div>
            )}
          </div>
        </>
      )
    }
    case 'unsubmitted': {
      return (
        <>
          <div className="pow-status">
            <Trans k={['glacierDrop', 'powStatus', 'puzzleSolved']} />
          </div>
          <div>
            {period === 'Unlocking' ? (
              <Button
                type="primary"
                className="small-button"
                onClick={() => onSubmitPuzzle(claim)}
                disabled={claim.txBuildInProgress}
              >
                <Trans k={['glacierDrop', 'button', 'submitProofOfUnlock']} />
              </Button>
            ) : (
              <span className="puzzle-warning">
                <Trans k={['glacierDrop', 'message', 'youCanNoLongerSubmitProof']} />
              </span>
            )}
          </div>
        </>
      )
    }
    case 'submitted': {
      return (
        <>
          <div className="tx-status">
            <TxStatusText txStatus={unlockStatus} />
          </div>
          {unlockStatus?.status === 'TransactionFailed' && (
            <Button
              type="primary"
              className="small-button remove-claim-button"
              onClick={() => onRemoveClaim(claim)}
            >
              <Trans k={['glacierDrop', 'button', 'removeClaim']} />
            </Button>
          )}
          <div className="pow-status">
            <Trans k={['glacierDrop', 'powStatus', 'powPuzzleSubmitted']} />
          </div>
          <div className="action-link">
            <Popover content={claim.unlockTxHash} placement="bottom">
              <span>
                <Trans k={['glacierDrop', 'link', 'viewUnlockTxnId']} />
              </span>
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
  unlocked: boolean
  showEpochs(): void
  onWithdrawDust(claim: Claim): void
}

const UnfreezeDetail = ({
  claim,
  unfrozenDustAmount,
  currentEpoch,
  numberOfEpochsForClaim,
  unlocked,
  showEpochs,
  onWithdrawDust,
}: UnfreezeDetailProps): JSX.Element => {
  const {formatPercentage} = useFormatters()

  const {puzzleStatus, dustAmount, withdrawnDustAmount} = claim

  const isUnfrozen = unfrozenDustAmount.isGreaterThan(0) && unlocked

  if (puzzleStatus === 'solving' || !isUnfrozen) {
    return <div>0%</div>
  }
  if (unfrozenDustAmount.isZero()) {
    return (
      <>
        <div>
          0%
          <span className="amount">
            0 / <ShortNumber big={dustAmount} /> {DST_CHAIN.symbol}
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
          {formatPercentage(unfrozenDustAmount.dividedBy(dustAmount))}
          <span className="amount">
            <ShortNumber big={unfrozenDustAmount} /> / <ShortNumber big={dustAmount} />{' '}
            {DST_CHAIN.symbol}
          </span>
        </div>
        {epochsRemaining > 0 && (
          <div className="action-link">
            <Trans
              k={['glacierDrop', 'link', 'remainingEpochsUntilFullUnfreeze']}
              count={epochsRemaining}
            />
          </div>
        )}
        <Button
          type="primary"
          className="small-button"
          onClick={() => onWithdrawDust(claim)}
          disabled={cannotWithdrawMore || claim.txBuildInProgress}
        >
          <Trans k={['glacierDrop', 'button', 'withdrawAvailableDust']} />
        </Button>
        <div className="action-link" {...fillActionHandlers(showEpochs)}>
          <Trans k={['glacierDrop', 'link', 'viewUnfreezingProgress']} />
        </div>
      </>
    )
  }
}

interface WithdrawDetailProps {
  claim: Claim
  withdrawalStatus: TransactionStatus | null
}

const WithdrawDetail = ({claim, withdrawalStatus}: WithdrawDetailProps): JSX.Element => {
  const {formatPercentage} = useFormatters()
  const {withdrawnDustAmount, dustAmount, withdrawTxHashes} = claim

  if (withdrawnDustAmount.isZero() || claim.puzzleStatus !== 'submitted') {
    return <div className="withdraw-progress">0%</div>
  }

  return (
    <>
      <div className="withdraw-progress">
        {formatPercentage(withdrawnDustAmount.dividedBy(dustAmount))}
        <span className="amount">
          <ShortNumber big={withdrawnDustAmount} /> / <ShortNumber big={dustAmount} />{' '}
          {DST_CHAIN.symbol}
        </span>
      </div>
      <div className="tx-status">
        <TxStatusText txStatus={withdrawalStatus} />
      </div>
      <div className="action-link">
        <Popover content={withdrawTxHashes[withdrawTxHashes.length - 1]} placement="bottom">
          <span>
            <Trans k={['glacierDrop', 'link', 'viewLatestWithdrawalTxnId']} />
          </span>
        </Popover>
      </div>
    </>
  )
}

const getUnlockProgressState = (
  claim: Claim,
  period: Period,
  unlockStatus: TransactionStatus | null,
): ProgressState => {
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
  callTxStatuses: CallTxStatuses
  showEpochs(): void
  onSubmitPuzzle(claim: Claim): void
  onWithdrawDust(claim: Claim): void
  onRemoveClaim(claim: Claim): void
}

export const ClaimRow = ({
  claim,
  index,
  currentBlock,
  periodConfig,
  callTxStatuses,
  showEpochs,
  onSubmitPuzzle,
  onWithdrawDust,
  onRemoveClaim,
}: ClaimRowProps): JSX.Element => {
  const {
    dustAmount,
    externalAmount,
    transparentAddress,
    externalAddress,
    withdrawnDustAmount,
  } = claim

  const unlocked = isUnlocked(claim, callTxStatuses)
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
  const unlockStatus = getUnlockStatus(claim, callTxStatuses)
  const withdrawalStatus = getWithdrawalStatus(claim, callTxStatuses)

  const unlockProgress = getUnlockProgressState(claim, period, unlockStatus)
  const unfreezeProgress = getNumericalProgressState(unfrozenDustAmount, dustAmount)
  const withdrawProgress = getNumericalProgressState(withdrawnDustAmount, dustAmount)

  return (
    <div className="ClaimRow">
      <div className="header">
        <div className="claim-title">
          <Trans k={['glacierDrop', 'title', 'claimNumber']} values={{number: index + 1}} />
        </div>
        <div className="exchange">
          <ShortNumber big={externalAmount} unit={ETC_CHAIN.unitType} /> {ETC_CHAIN.symbol}
          <SVG src={exchangeIcon} className="icon" />
          <ShortNumber big={dustAmount} /> {DST_CHAIN.symbol}
        </div>
        <div className="external-address">
          <Popover content={externalAddress} placement="bottom">
            <span>
              <Trans k={['glacierDrop', 'label', 'etcAddress']} />: {externalAddress}
            </span>
          </Popover>
        </div>
        <div className="midnight-address">
          <Popover content={transparentAddress} placement="bottom">
            <span>
              <Trans k={['glacierDrop', 'label', 'transparentMidnightAddress']} />:{' '}
              {transparentAddress}
            </span>
          </Popover>
        </div>
      </div>
      <div className="status">
        <div className="progress">
          <ProgressIcon progressState={'checked'} />{' '}
          <span className="checked">
            <Trans k={['glacierDrop', 'claimStatus', 'claimed']} />
          </span>
        </div>
        <div className="line"></div>
        <div className="progress">
          <ProgressIcon progressState={unlockProgress} />{' '}
          <span className={unlockProgress}>
            <Trans k={['glacierDrop', 'claimStatus', 'unlocked']} />
          </span>
        </div>
        <div className="line"></div>
        <div className="progress">
          <ProgressIcon progressState={unfreezeProgress} />{' '}
          <span className={unfreezeProgress}>
            <Trans k={['glacierDrop', 'claimStatus', 'unfrozen']} />
          </span>
        </div>
        <div className="line"></div>
        <div className="progress">
          <ProgressIcon progressState={withdrawProgress} />{' '}
          <span className={withdrawProgress}>
            <Trans k={['glacierDrop', 'claimStatus', 'withdrawn']} />
          </span>
        </div>

        <div className="claimed detail">
          <div>
            <ShortNumber big={dustAmount} /> {DST_CHAIN.symbol}
          </div>
        </div>
        <div className="unlocked detail">
          <div>
            <ShortNumber big={unlockedDustAmount} /> {DST_CHAIN.symbol}
          </div>
          <div className="puzzle-progress">
            <PuzzleProgress
              claim={claim}
              periodConfig={periodConfig}
              currentBlock={currentBlock}
              unlockStatus={unlockStatus}
              onSubmitPuzzle={onSubmitPuzzle}
              onRemoveClaim={onRemoveClaim}
            />
          </div>
        </div>
        <div className="unfrozen detail">
          <UnfreezeDetail
            claim={claim}
            unfrozenDustAmount={unfrozenDustAmount}
            numberOfEpochsForClaim={numberOfEpochsForClaim}
            currentEpoch={getCurrentEpoch(currentBlock, periodConfig)}
            unlocked={unlocked}
            showEpochs={showEpochs}
            onWithdrawDust={onWithdrawDust}
          />
        </div>
        <div className="withdrawn detail">
          <WithdrawDetail claim={claim} withdrawalStatus={withdrawalStatus} />
        </div>
      </div>
    </div>
  )
}
