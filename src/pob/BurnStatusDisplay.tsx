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
  BURN_OBSERVED: {started: 'IN_PROGRESS', success: 'UNKNOWN', confirm: 'UNKNOWN'},
  PROOF_READY: {started: 'CHECKED', success: 'IN_PROGRESS', confirm: 'UNKNOWN'},
  PROOF_FAIL: {started: 'FAILED', success: 'FAILED', confirm: 'FAILED'},
  TX_VALUE_TOO_LOW: {started: 'FAILED', success: 'FAILED', confirm: 'FAILED'},
  COMMITMENT_APPEARED: {
    started: 'CHECKED',
    success: 'IN_PROGRESS',
    confirm: 'UNKNOWN',
  },
  COMMITMENT_CONFIRMED: {
    started: 'CHECKED',
    success: 'IN_PROGRESS',
    confirm: 'UNKNOWN',
  },
  COMMITMENT_FAIL: {
    started: 'CHECKED',
    success: 'FAILED',
    confirm: 'FAILED',
  },
  REVEAL_APPEARED: {
    started: 'CHECKED',
    success: 'CHECKED',
    confirm: 'IN_PROGRESS',
  },
  REVEAL_CONFIRMED: {
    started: 'CHECKED',
    success: 'CHECKED',
    confirm: 'CHECKED',
  },
  REVEAL_FAIL: {
    started: 'CHECKED',
    success: 'CHECKED',
    confirm: 'FAILED',
  },
  REVEAL_DONE_ANOTHER_PROVER: {
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

const DisplayProgress = ({ratio}: {ratio: number | 'unknown'}): JSX.Element => (
  <div className="percentage">
    {ratio === 'unknown' && <Icon type="loading" style={{fontSize: 12}} spin />}
    {ratio !== 'unknown' && `${formatPercentage(_.clamp(ratio, 0, 0.99))}%`}
  </div>
)

const ProvingStarted = ({progress}: {progress: ProgressType}): JSX.Element => {
  switch (progress) {
    case 'IN_PROGRESS':
      return (
        <Popover
          content="Waiting for enough confirmations from source blockchain to start."
          placement="top"
        >
          {PROGRESS_ICONS[progress]} Proving Started
        </Popover>
      )
    case 'CHECKED':
      return (
        <Popover content="Confirmations received from source blockchain." placement="top">
          {PROGRESS_ICONS[progress]} Proving Started
        </Popover>
      )
    default:
      return <>{PROGRESS_ICONS[progress]} Proving Started</>
  }
}

const ProvingSuccessful = ({progress}: {progress: ProgressType}): JSX.Element => {
  switch (progress) {
    case 'IN_PROGRESS':
      return (
        <Popover content="Proving underway." placement="top">
          {PROGRESS_ICONS[progress]} Proving Successful
        </Popover>
      )
    case 'CHECKED':
      return (
        <Popover content="Prover has successfully proved the burn transaction." placement="top">
          {PROGRESS_ICONS[progress]} Proving Successful
        </Popover>
      )
    default:
      return <>{PROGRESS_ICONS[progress]} Proving Successful</>
  }
}

const ProvingConfirmed = ({progress}: {progress: ProgressType}): JSX.Element => {
  switch (progress) {
    case 'IN_PROGRESS':
      return (
        <Popover content="Waiting for confirmations on Midnight." placement="top">
          {PROGRESS_ICONS[progress]} Proving Confirmed
        </Popover>
      )
    case 'CHECKED':
      return (
        <Popover
          content="Burn Process complete. Midnight Tokens are now available."
          placement="top"
        >
          {PROGRESS_ICONS[progress]} Proving Confirmed
        </Popover>
      )
    default:
      return <>{PROGRESS_ICONS[progress]} Proving Confirmed</>
  }
}

const NUMBER_OF_BLOCKS_TO_SUCCESS = 10
const NUMBER_OF_BLOCKS_TO_CONFIRM = 4

const startedProgress = (current: number, tx: number | null, start: number | null): number =>
  start && tx && start !== tx ? (current - tx) / (start - tx) : 0

const successProgress = (status: BurnStatusType, current: number, tx: number): number => {
  switch (status) {
    case 'PROOF_READY':
      return 0
    case 'COMMITMENT_APPEARED':
      return 0.1
    default:
      return 0.1 + (0.9 * (current - tx)) / NUMBER_OF_BLOCKS_TO_SUCCESS
  }
}

const confirmProgress = (current: number, tx: number): number =>
  (current - tx) / NUMBER_OF_BLOCKS_TO_CONFIRM

export const TX_VALUE_TOO_LOW_MESSAGE = 'Transaction value or fee was too low.'

const DisplayError = ({
  errorMessage,
  status,
}: {
  errorMessage?: string
  status: BurnStatusType
}): JSX.Element => {
  if (errorMessage) {
    return (
      <div className="error">
        Information about burn progress might be out-dated. Gathering burn activity from the prover
        failed with the following error:
        <br />
        {errorMessage}
      </div>
    )
  }

  if (status === 'TX_VALUE_TOO_LOW') {
    return <div className="error">{TX_VALUE_TOO_LOW_MESSAGE}</div>
  }

  return <></>
}

export const BurnStatusDisplay: React.FunctionComponent<BurnStatusDisplayProps> = ({
  address,
  syncStatus,
  burnStatus,
  errorMessage,
}: BurnStatusDisplayProps) => {
  const chain = CHAINS[burnStatus.chain]
  const progress = STATUS_TO_PROGRESS[burnStatus.status]

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
          <CopyableLongText content={burnStatus.midnight_txid} />
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
          <ProvingStarted progress={progress.started} />
        </div>
        <div className="line">
          {progress.success === 'IN_PROGRESS' && (
            <DisplayProgress
              ratio={
                syncStatus.mode === 'offline' || burnStatus.midnight_txid_height === null
                  ? 'unknown'
                  : successProgress(
                      burnStatus.status,
                      syncStatus.highestKnownBlock,
                      burnStatus.midnight_txid_height,
                    )
              }
            />
          )}
        </div>
        <div className="progress">
          <ProvingSuccessful progress={progress.success} />
        </div>
        <div className="line">
          {progress.confirm === 'IN_PROGRESS' && (
            <DisplayProgress
              ratio={
                syncStatus.mode === 'offline' || burnStatus.midnight_txid_height === null
                  ? 'unknown'
                  : confirmProgress(syncStatus.highestKnownBlock, burnStatus.midnight_txid_height)
              }
            />
          )}
        </div>
        <div className="progress">
          <ProvingConfirmed progress={progress.confirm} />
        </div>
      </div>
      <DisplayError errorMessage={errorMessage} status={burnStatus.status} />
    </div>
  )
}
