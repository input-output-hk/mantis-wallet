import React, {ReactNode, useState} from 'react'
import SVG from 'react-inlinesvg'
import {CloseOutlined, LoadingOutlined, RightOutlined} from '@ant-design/icons'
import {Popover} from 'antd'
import _ from 'lodash'
import classnames from 'classnames'
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
import {InfoIcon} from '../common/InfoIcon'
import {NUMBER_OF_BLOCKS_TO_SUCCESS, NUMBER_OF_BLOCKS_TO_CONFIRM} from './pob-config'
import {Link} from '../common/Link'
import {LINKS} from '../external-link-config'
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
  UNKNOWN: <CloseOutlined className="unknown icon" title="Unknown" />,
  FAILED: <CloseOutlined className="fail icon" title="Failed" />,
  IN_PROGRESS: <SVG src={refreshIcon} className="in-progress icon" title="In progress" />,
}

type DisplayProgressRatio = number | 'unknown'

const DisplayProgress = ({ratio}: {ratio: DisplayProgressRatio}): JSX.Element => (
  <div className="percentage">
    {ratio === 'unknown' && <LoadingOutlined style={{fontSize: 12}} spin />}
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
        <span>{labelWithIcon}</span>
      </Popover>
    )
  } else {
    return labelWithIcon
  }
}

const startedProgress = (current: number, tx: number | null, start: number | null): number =>
  start && tx && start !== tx ? (current - tx) / (start - tx) : 0

const getTransactionProgress = (blocks: number, submittedStatus: BurnStatusType) => (
  status: BurnStatusType,
  txHeight: number | null,
  syncStatus: SynchronizationStatus,
): DisplayProgressRatio => {
  if (status === submittedStatus) return 1 / (blocks + 1)
  if (txHeight === null || syncStatus.mode === 'offline') return 'unknown'
  return (1 + syncStatus.highestKnownBlock - txHeight) / (blocks + 1)
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
  const [detailsShown, setDetailsShown] = useState(false)

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
      <div
        className={classnames('exchange-info', {open: detailsShown})}
        onClick={() => setDetailsShown(!detailsShown)}
      >
        <div className="collapse-icon">
          <RightOutlined />
        </div>
        <span>Burn Amount / Midnight Token: </span>
        {burnStatus.tx_value && (
          <>
            <ShortNumber big={burnStatus.tx_value} unit={chain.unitType} /> {chain.symbol}{' '}
            <SVG src={exchangeIcon} className="exchange-icon" />{' '}
            <ShortNumber big={burnStatus.tx_value} unit={chain.unitType} /> M-
            {chain.symbol}
          </>
        )}
      </div>
      <div className="status">
        <div className="progress">
          <Popover
            content="Your burn transaction has been found on source blockchain."
            placement="top"
          >
            <span>{PROGRESS_ICONS['CHECKED']} Found Transaction</span>
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
      <div className={classnames('burn-details', {active: detailsShown})}>
        <div className="burn-details-header">Burn Details</div>
        <div className="burn-details-info">
          <div>Burn address:</div>
          <div>
            <CopyableLongText content={address} />
          </div>
          <div>Associated midnight address:</div>
          <div>
            <CopyableLongText content={burnStatus.burnAddressInfo.midnightAddress} />
          </div>
          <div>Prover&apos;s reward:</div>
          <div>
            <ShortNumber big={burnStatus.burnAddressInfo.reward} unit={chain.unitType} /> M-
            {chain.symbol}
          </div>
          <div>Prover:</div>
          <div>
            {burnStatus.prover.name} ({burnStatus.prover.address})
          </div>
        </div>
        <div className="burn-details-info">
          <div>Burn transaction:</div>
          <div>
            <CopyableLongText content={burnStatus.txid} />
          </div>
          <div>
            <InfoIcon content="Tagging Federation has monitored Source chains and published commitments to them on the Midnight Network" />{' '}
            Commitment contract submission:
          </div>
          <div>
            <CopyableLongText content={burnStatus.commitment_txid} fallback="-" />
          </div>
          <div>
            <InfoIcon content="Prover is certain that the burn can be redeemed and has created Midnight Tokens" />{' '}
            Redeem contract submission:
          </div>
          <div>
            <CopyableLongText content={burnStatus.redeem_txid} fallback="-" />
          </div>
        </div>
      </div>
      {burnStatus.fail_reason && (
        <div className="error">
          {burnStatus.fail_reason}{' '}
          <Link href={LINKS.aboutPoB} className="help">
            Learn more
          </Link>
        </div>
      )}
      {errorMessage && (
        <div className="error">
          Information about burn progress might be outdated. Gathering burn activity from the prover
          failed with the following error:
          <br />
          {errorMessage}
        </div>
      )}
    </div>
  )
}
