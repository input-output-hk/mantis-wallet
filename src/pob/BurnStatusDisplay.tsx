import React, {ReactNode} from 'react'
import SVG from 'react-inlinesvg'
import {Icon, Popover} from 'antd'
import _ from 'lodash'
import {CHAINS} from './chains'
import {BurnStatusType} from './api/prover'
import {formatPercentage} from '../common/formatters'
import checkIcon from '../assets/icons/check.svg'
import refreshIcon from '../assets/icons/refresh.svg'
import exchangeIcon from '../assets/icons/exchange.svg'
import {ShortNumber} from '../common/ShortNumber'
import {CopyableLongText} from '../common/CopyableLongText'
import {RealBurnStatus} from './pob-state'
import {SynchronizationStatus} from '../common/wallet-state'
import './BurnStatusDisplay.scss'

type ProgressType = 'CHECKED' | 'UNKNOWN' | 'FAILED' | 'IN_PROGRESS'

interface AllProgress {
  started: ProgressType
  success: ProgressType
  confirm: ProgressType
}

interface BurnStatusDisplayProps {
  address: string
  syncStatus: SynchronizationStatus
  burnStatus: RealBurnStatus
  errorMessage?: string
}

const STATUS_TO_PROGRESS: Record<BurnStatusType, AllProgress> = {
  tx_found: {started: 'IN_PROGRESS', success: 'UNKNOWN', confirm: 'UNKNOWN'},
  commitment_submitted: {started: 'CHECKED', success: 'IN_PROGRESS', confirm: 'UNKNOWN'},
  proof_fail: {started: 'FAILED', success: 'FAILED', confirm: 'FAILED'},
  commitment_appeared: {
    started: 'CHECKED',
    success: 'IN_PROGRESS',
    confirm: 'UNKNOWN',
  },
  redeem_submitted: {
    started: 'CHECKED',
    success: 'CHECKED',
    confirm: 'IN_PROGRESS',
  },
  commitment_fail: {
    started: 'CHECKED',
    success: 'FAILED',
    confirm: 'FAILED',
  },
  redeem_appeared: {
    started: 'CHECKED',
    success: 'CHECKED',
    confirm: 'IN_PROGRESS',
  },
  redeem_fail: {
    started: 'CHECKED',
    success: 'CHECKED',
    confirm: 'FAILED',
  },
  redeem_another_prover: {
    started: 'CHECKED',
    success: 'CHECKED',
    confirm: 'CHECKED',
  },
}

const PROGRESS_ICONS: Record<ProgressType, ReactNode> = {
  CHECKED: <SVG src={checkIcon} className="checked icon" title="Checked" />,
  UNKNOWN: <Icon type="close" className="unknown icon" title="Unknown" />,
  FAILED: <Icon type="close" className="fail icon" title="Failed" />,
  IN_PROGRESS: <SVG src={refreshIcon} className="in-progress icon" title="In progress" />,
}

type DisplayProgressRatio = number | 'unknown'

const DisplayProgress = ({ratio}: {ratio: DisplayProgressRatio}): JSX.Element => (
  <div className="percentage">
    {ratio === 'unknown' && <Icon type="loading" style={{fontSize: 12}} spin />}
    {ratio !== 'unknown' && `${formatPercentage(_.clamp(ratio, 0, 0.99))}%`}
  </div>
)

const ProvingProgressLabel = ({
  progress,
  label,
  inProgressMessage,
  checkedMessage,
}: {
  progress: ProgressType
  label: string
  inProgressMessage: string
  checkedMessage: string
}): JSX.Element => {
  const labelWithIcon = (
    <span>
      {PROGRESS_ICONS[progress]} {label}
    </span>
  )

  if (progress === 'IN_PROGRESS' || progress === 'CHECKED') {
    return (
      <Popover
        content={progress === 'IN_PROGRESS' ? inProgressMessage : checkedMessage}
        placement="top"
      >
        {labelWithIcon}
      </Popover>
    )
  } else {
    return labelWithIcon
  }
}

const NUMBER_OF_BLOCKS_TO_SUCCESS = 10
const NUMBER_OF_BLOCKS_TO_CONFIRM = 4

const startedProgress = (current: number, tx: number | null, start: number | null): number =>
  start && tx && start !== tx ? (current - tx) / (start - tx) : 0

const getTransactionProgress = (blocks: number, submittedStatus: BurnStatusType) => (
  status: BurnStatusType,
  txHeight: number | null,
  syncStatus: SynchronizationStatus,
): DisplayProgressRatio => {
  if (status === submittedStatus) return 1 / (blocks + 1)
  if (txHeight === null || syncStatus.mode === 'offline') return 'unknown'
  return (1 + syncStatus.highestKnownBlock - txHeight) / (NUMBER_OF_BLOCKS_TO_SUCCESS + 1)
}

const isRedeemDone = (
  syncStatus: SynchronizationStatus,
  redeemTxHeight: number | null,
): boolean => {
  return (
    syncStatus.mode === 'online' &&
    redeemTxHeight != null &&
    redeemTxHeight + NUMBER_OF_BLOCKS_TO_CONFIRM <= syncStatus.highestKnownBlock
  )
}

export const BurnStatusDisplay: React.FunctionComponent<BurnStatusDisplayProps> = ({
  address,
  syncStatus,
  burnStatus,
  errorMessage,
}: BurnStatusDisplayProps) => {
  const chain = CHAINS[burnStatus.burnAddressInfo.chainId]
  const progress: AllProgress = isRedeemDone(syncStatus, burnStatus.redeem_txid_height)
    ? {
        started: 'CHECKED',
        success: 'CHECKED',
        confirm: 'CHECKED',
      }
    : STATUS_TO_PROGRESS[burnStatus.status]

  return (
    <div className="BurnStatusDisplay">
      <div className="info">
        <div className="info-element">
          <CopyableLongText content={address} />
        </div>
        <div className="info-element">
          {burnStatus.tx_value && (
            <>
              <ShortNumber big={burnStatus.tx_value} unit={chain.unitType} /> {chain.symbol}{' '}
              <SVG src={exchangeIcon} className="exchange-icon" />{' '}
              <ShortNumber big={burnStatus.tx_value} unit={chain.unitType} /> M-
              {chain.symbol}
            </>
          )}
        </div>
        <div className="info-element">
          <CopyableLongText content={burnStatus.commitment_txid} />
          {burnStatus.redeem_txid && (
            <>
              <br />
              <CopyableLongText content={burnStatus.redeem_txid} />
            </>
          )}
        </div>
        <div className="info-element">
          <CopyableLongText content={burnStatus.txid} />
        </div>
      </div>
      <div className="status">
        <div className="progress">
          <Popover
            content="Your burn transaction has been found on source blockchain."
            placement="top"
          >
            {PROGRESS_ICONS['CHECKED']} Found Transaction
          </Popover>
        </div>
        <div className="line">
          {progress.started === 'IN_PROGRESS' && (
            <DisplayProgress
              ratio={startedProgress(
                burnStatus.current_source_height,
                burnStatus.burn_tx_height,
                burnStatus.processing_start_height,
              )}
            />
          )}
        </div>
        <div className="progress">
          <ProvingProgressLabel
            progress={progress.started}
            label="Proving Started"
            inProgressMessage="Waiting for enough confirmations from source blockchain to start."
            checkedMessage="Confirmations received from source blockchain."
          />
        </div>
        <div className="line">
          {progress.success === 'IN_PROGRESS' && (
            <DisplayProgress
              ratio={getTransactionProgress(NUMBER_OF_BLOCKS_TO_SUCCESS, 'commitment_submitted')(
                burnStatus.status,
                burnStatus.commitment_txid_height,
                syncStatus,
              )}
            />
          )}
        </div>
        <div className="progress">
          <ProvingProgressLabel
            progress={progress.success}
            label="Proving Successful"
            inProgressMessage="Proving underway."
            checkedMessage="Prover has successfully proved the burn transaction."
          />
        </div>
        <div className="line">
          {progress.confirm === 'IN_PROGRESS' && (
            <DisplayProgress
              ratio={getTransactionProgress(NUMBER_OF_BLOCKS_TO_CONFIRM, 'redeem_submitted')(
                burnStatus.status,
                burnStatus.redeem_txid_height,
                syncStatus,
              )}
            />
          )}
        </div>
        <div className="progress">
          <ProvingProgressLabel
            progress={progress.confirm}
            label="Proving Confirmed"
            inProgressMessage="Waiting for confirmations on Midnight."
            checkedMessage="Burn Process complete. Midnight Tokens are now available."
          />
        </div>
      </div>
      {burnStatus.fail_reason && <div className="error">{burnStatus.fail_reason}</div>}
      {errorMessage && (
        <div className="error">
          Information about burn progress might be out-dated. Gathering burn activity from the
          prover failed with the following error:
          <br />
          {errorMessage}
        </div>
      )}
    </div>
  )
}
