import React, {ReactNode} from 'react'
import SVG from 'react-inlinesvg'
import {Icon, Popover} from 'antd'
import {CHAINS} from './chains'
import {BurnStatusType, BurnApiStatus} from './api/prover'
import checkIcon from '../assets/icons/check.svg'
import refreshIcon from '../assets/icons/refresh.svg'
import exchangeIcon from '../assets/icons/exchange.svg'
import {copyToClipboard} from '../common/clipboard'
import './BurnStatusDisplay.scss'

type ProgressType = 'CHECKED' | 'UNKNOWN' | 'FAILED' | 'IN_PROGRESS'

interface AllProgress {
  started: ProgressType
  success: ProgressType
  confirm: ProgressType
}

interface BurnStatusDisplayProps {
  address: string
  burnStatus: BurnApiStatus
  errorMessage?: string
}

const STATUS_TO_PROGRESS: Record<BurnStatusType, AllProgress> = {
  BURN_OBSERVED: {started: 'IN_PROGRESS', success: 'UNKNOWN', confirm: 'UNKNOWN'},
  PROOF_READY: {started: 'CHECKED', success: 'IN_PROGRESS', confirm: 'UNKNOWN'},
  PROOF_FAIL: {started: 'FAILED', success: 'FAILED', confirm: 'FAILED'},
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
  CHECKED: <SVG src={checkIcon} className="checked icon" />,
  UNKNOWN: <Icon type="close" className="unknown icon" />,
  FAILED: <Icon type="close" className="fail icon" />,
  IN_PROGRESS: <SVG src={refreshIcon} className="in-progress icon" />,
}

const ShowLongText = ({content}: {content: string | null}): JSX.Element =>
  content == null ? (
    <></>
  ) : (
    <div className="long-text">
      <Icon type="copy" className="clickable" onClick={() => copyToClipboard(content)} />{' '}
      <Popover content={content} placement="top">
        {content}
      </Popover>
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

export const BurnStatusDisplay: React.FunctionComponent<BurnStatusDisplayProps> = ({
  address,
  burnStatus,
  errorMessage,
}: BurnStatusDisplayProps) => {
  const chain = CHAINS[burnStatus.chain]
  const progress = STATUS_TO_PROGRESS[burnStatus.status]

  return (
    <div className="BurnStatusDisplay">
      <div className="info">
        <div className="info-element">
          <ShowLongText content={address} />
        </div>
        <div className="info-element">
          {chain && (
            <>
              1 {chain.symbol} <SVG src={exchangeIcon} className="exchange-icon" /> 1 M-
              {chain.symbol}
            </>
          )}
        </div>
        <div className="info-element">
          <ShowLongText content={burnStatus.midnight_txid} />
        </div>
        <div className="info-element">
          <ShowLongText content={burnStatus.txid} />
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
        <div className="line"></div>
        <div className="progress">
          <ProvingStarted progress={progress.started} />
        </div>
        <div className="line"></div>
        <div className="progress">
          <ProvingSuccessful progress={progress.success} />
        </div>
        <div className="line"></div>
        <div className="progress">
          <ProvingConfirmed progress={progress.confirm} />
        </div>
      </div>
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
