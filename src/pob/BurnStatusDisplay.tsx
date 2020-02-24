import React, {ReactNode} from 'react'
import SVG from 'react-inlinesvg'
import {Icon} from 'antd'
import {BurnStatus} from './pob-state'
import {CHAINS} from './chains'
import {BurnStatusType} from './api/prover'
import checkIcon from '../assets/icons/check.svg'
import refreshIcon from '../assets/icons/refresh.svg'
import exchangeIcon from '../assets/icons/exchange.svg'
import './BurnStatusDisplay.scss'

type ProgressType = 'CHECKED' | 'UNKNOWN' | 'FAILED' | 'IN_PROGRESS'

interface AllProgress {
  found: ProgressType
  started: ProgressType
  success: ProgressType
  confirm: ProgressType
}

interface BurnStatusDisplayProps {
  address: string
  status: BurnStatus
}

const DEFAULT_PROGRESS: AllProgress = {
  found: 'UNKNOWN',
  started: 'UNKNOWN',
  success: 'UNKNOWN',
  confirm: 'UNKNOWN',
}

const STATUS_TO_PROGRESS: Record<BurnStatusType, AllProgress> = {
  ['No burn transactions observed.']: DEFAULT_PROGRESS,
  BURN_OBSERVED: {found: 'CHECKED', started: 'IN_PROGRESS', success: 'UNKNOWN', confirm: 'UNKNOWN'},
  PROOF_READY: {found: 'CHECKED', started: 'CHECKED', success: 'IN_PROGRESS', confirm: 'UNKNOWN'},
  PROOF_FAIL: {found: 'CHECKED', started: 'FAILED', success: 'FAILED', confirm: 'FAILED'},
  COMMITMENT_APPEARED: {
    found: 'CHECKED',
    started: 'CHECKED',
    success: 'IN_PROGRESS',
    confirm: 'UNKNOWN',
  },
  COMMITMENT_CONFIRMED: {
    found: 'CHECKED',
    started: 'CHECKED',
    success: 'IN_PROGRESS',
    confirm: 'UNKNOWN',
  },
  COMMITMENT_FAIL: {
    found: 'CHECKED',
    started: 'CHECKED',
    success: 'FAILED',
    confirm: 'FAILED',
  },
  REVEAL_APPEARED: {
    found: 'CHECKED',
    started: 'CHECKED',
    success: 'CHECKED',
    confirm: 'IN_PROGRESS',
  },
  REVEAL_CONFIRMED: {
    found: 'CHECKED',
    started: 'CHECKED',
    success: 'CHECKED',
    confirm: 'CHECKED',
  },
  REVEAL_FAIL: {
    found: 'CHECKED',
    started: 'CHECKED',
    success: 'FAILED',
    confirm: 'FAILED',
  },
  REVEAL_DONE_ANOTHER_PROVER: {
    found: 'CHECKED',
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

export const BurnStatusDisplay: React.FunctionComponent<BurnStatusDisplayProps> = ({
  address,
  status: {lastStatus, error},
}: BurnStatusDisplayProps) => {
  const chain = CHAINS.find(({id}) => id === lastStatus.chain)
  const progress = STATUS_TO_PROGRESS[lastStatus.status]

  return (
    <div className="BurnStatusDisplay">
      <div className="info">
        <div className="info-element">{address}</div>
        <div className="info-element">
          {chain && (
            <>
              1 {chain.symbol} <SVG src={exchangeIcon} className="exchange-icon" /> 1 M-
              {chain.symbol}
            </>
          )}
        </div>
        <div className="info-element">{lastStatus['txid']}</div>
        <div className="last">{lastStatus.midnight_txid}</div>
      </div>
      <div className="status">
        <div className="progress">{PROGRESS_ICONS[progress.found]} Found Transaction</div>
        <div className="line"></div>
        <div className="progress">{PROGRESS_ICONS[progress.started]} Proving Started</div>
        <div className="line"></div>
        <div className="progress">{PROGRESS_ICONS[progress.success]} Proving Successful</div>
        <div className="line"></div>
        <div className="progress">{PROGRESS_ICONS[progress.confirm]} Proving Confirmed</div>
      </div>
      {error && <div className="error">{error.message}</div>}
    </div>
  )
}
