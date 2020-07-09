import React, {ReactNode, useState, useEffect} from 'react'
import BigNumber from 'bignumber.js'
import SVG from 'react-inlinesvg'
import {
  CloseOutlined,
  LoadingOutlined,
  RightOutlined,
  EyeInvisibleOutlined,
  EyeOutlined,
  WarningOutlined,
} from '@ant-design/icons'
import {Popover, Progress} from 'antd'
import {TooltipPlacement} from 'antd/lib/tooltip'
import _ from 'lodash'
import classnames from 'classnames'
import {CHAINS} from './chains'
import {BurnStatusType} from './api/prover'
import checkIcon from '../assets/icons/check.svg'
import refreshIcon from '../assets/icons/refresh.svg'
import exchangeIcon from '../assets/icons/exchange.svg'
import circleIcon from '../assets/icons/circle.svg'
import {ShortNumber} from '../common/ShortNumber'
import {CopyableLongText} from '../common/CopyableLongText'
import {RealBurnStatus, BurnWatcher, BurnAddressInfo, ProofOfBurnData} from './pob-state'
import {SynchronizationStatus} from '../common/wallet-state'
import {InfoIcon} from '../common/InfoIcon'
import {
  NUMBER_OF_BLOCKS_TO_SUCCESS,
  NUMBER_OF_BLOCKS_TO_CONFIRM,
  NUMBER_OF_BLOCKS_AFTER_TX_FOUND,
} from './pob-config'
import {Link} from '../common/Link'
import {LINKS} from '../external-link-config'
import * as styles from '../vars-for-ts.scss'
import './BurnStatusDisplay.scss'

type ProgressType = 'CHECKED' | 'UNKNOWN' | 'FAILED' | 'IN_PROGRESS' | 'STOPPED'

interface AllProgress {
  started: ProgressType
  success: ProgressType
  confirm: ProgressType
}

interface BurnStatusDisplayProps extends Pick<ProofOfBurnData, 'hideBurnProcess'> {
  burnWatcher: BurnWatcher
  burnAddressInfo: BurnAddressInfo
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
    confirm: 'STOPPED',
  },
}

const PROGRESS_ICONS: Record<ProgressType, ReactNode> = {
  CHECKED: <SVG src={checkIcon} className="checked icon" title="Checked" />,
  UNKNOWN: <CloseOutlined className="unknown icon" title="Unknown" />,
  FAILED: <CloseOutlined className="fail icon" title="Failed" />,
  IN_PROGRESS: <SVG src={refreshIcon} className="in-progress icon" title="In progress" />,
  STOPPED: <SVG src={circleIcon} className="stopped icon" title="Stopped" />,
}

type DisplayProgressRatio = number | 'unknown'

const ProvingProgressLabel = ({
  progress,
  label,
  inProgressMessage,
  checkedMessage,
  placement = 'top',
}: {
  progress: ProgressType
  label: string
  inProgressMessage: string
  checkedMessage: string
  placement?: TooltipPlacement
}): JSX.Element => {
  const labelWithIcon = (
    <span>
      {PROGRESS_ICONS[progress]} {label}
    </span>
  )

  if (progress === 'IN_PROGRESS' || progress === 'CHECKED' || progress === 'STOPPED') {
    return (
      <Popover
        content={progress === 'IN_PROGRESS' ? inProgressMessage : checkedMessage}
        placement={placement}
      >
        <span>{labelWithIcon}</span>
      </Popover>
    )
  } else {
    return labelWithIcon
  }
}

const startedProgress = (current: number, tx: number | null, start: number | null): number =>
  start && tx && start !== tx ? (current - tx) / (start + NUMBER_OF_BLOCKS_AFTER_TX_FOUND - tx) : 0

const getTransactionProgress = (blocks: number, submittedStatus: BurnStatusType) => (
  status: BurnStatusType,
  txHeight: number | null,
  syncStatus: SynchronizationStatus,
): number => {
  if (status === submittedStatus) return 1 / (blocks + 1)
  if (txHeight === null || syncStatus.mode === 'offline') return 2 / (blocks + 1)
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

const DisplayProgressNew = ({
  progressType,
  ratio,
  showOfflineWarning = false,
}: {
  progressType: ProgressType
  ratio: number
  showOfflineWarning?: boolean
}): JSX.Element => {
  switch (progressType) {
    case 'UNKNOWN':
      return <div className="line" />
    case 'CHECKED':
      return (
        <div className="progress-bar">
          <Progress
            strokeColor={styles.successColor}
            status="success"
            percent={100}
            showInfo={false}
          />
        </div>
      )
    case 'FAILED':
      return (
        <div className="progress-bar">
          <Progress
            strokeColor={styles.errorColor}
            status="exception"
            percent={100}
            showInfo={false}
          />
        </div>
      )
    case 'STOPPED':
      return (
        <div className="progress-bar">
          <Progress
            strokeColor={styles.warningColor}
            status="normal"
            percent={100}
            showInfo={false}
          />
        </div>
      )
    case 'IN_PROGRESS':
      return (
        <div className="progress-bar">
          <Progress
            strokeColor={{
              from: styles.successColor,
              to: styles.lunaBlue,
            }}
            status="active"
            percent={100 * _.clamp(ratio, 0, 0.99)}
            showInfo={false}
          />
          {showOfflineWarning && (
            <Popover content="Your wallet is connecting at the moment, the progress might be out-dated.">
              <div className="offline-warning">
                <WarningOutlined title="warning" />
              </div>
            </Popover>
          )}
        </div>
      )
  }
}

export const BurnStatusDisplay: React.FunctionComponent<BurnStatusDisplayProps> = ({
  burnWatcher,
  hideBurnProcess,
  burnAddressInfo,
  syncStatus,
  burnStatus,
  errorMessage,
}: BurnStatusDisplayProps) => {
  const [hidingProgress, setHidingProgress] = useState<{to: boolean} | 'persisted'>('persisted')
  const [detailsShown, setDetailsShown] = useState(false)

  useEffect(() => {
    if (hidingProgress !== 'persisted' && hidingProgress.to === burnStatus.isHidden) {
      setHidingProgress('persisted')
    }
  }, [burnStatus.isHidden])

  const chain = CHAINS[burnAddressInfo.chainId]
  const progress: AllProgress = isRedeemDone(syncStatus, burnStatus.redeem_txid_height)
    ? {
        started: 'CHECKED',
        success: 'CHECKED',
        confirm: 'CHECKED',
      }
    : STATUS_TO_PROGRESS[burnStatus.status]

  return (
    <div className={classnames('BurnStatusDisplay', {hidden: burnStatus.isHidden})}>
      <div className={classnames('actions', {forceDisplay: hidingProgress !== 'persisted'})}>
        <Popover
          content={burnStatus.isHidden ? 'Unhide this burn process' : `Hide this burn process`}
          placement="topRight"
          align={{offset: [13, 0]}}
        >
          {hidingProgress === 'persisted' ? (
            <span
              className="toggle-hide"
              onClick={() => {
                setHidingProgress({to: !burnStatus.isHidden})
                hideBurnProcess(burnWatcher, burnStatus.txid, !burnStatus.isHidden)
              }}
            >
              {burnStatus.isHidden ? <EyeInvisibleOutlined /> : <EyeOutlined />}
            </span>
          ) : (
            <LoadingOutlined spin />
          )}
        </Popover>
      </div>
      <div className="summary">
        <div className="logo">
          <SVG src={chain.burnLogo} />
        </div>
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
              <span className="final-amount">
                <ShortNumber
                  big={new BigNumber(burnStatus.tx_value).minus(burnAddressInfo.reward)}
                  unit={chain.unitType}
                />{' '}
                M-
                {chain.symbol}
              </span>
              <span className="prover-reward">
                {' + '}
                <ShortNumber big={burnAddressInfo.reward} unit={chain.unitType} /> M-
                {chain.symbol} (Prover&apos;s reward)
              </span>
            </>
          )}
        </div>
        <div className="status">
          <div className="progress">
            <Popover
              content="Your burn transaction has been found on source blockchain."
              placement="topLeft"
            >
              <span>{PROGRESS_ICONS['CHECKED']} Found Transaction</span>
            </Popover>
          </div>
          <DisplayProgressNew
            progressType={progress.started}
            ratio={startedProgress(
              burnStatus.current_source_height,
              burnStatus.burn_tx_height,
              burnStatus.processing_start_height,
            )}
          />
          <div className="progress">
            <ProvingProgressLabel
              progress={progress.started}
              label="Proving Started"
              inProgressMessage="Waiting for enough confirmations from source blockchain to start."
              checkedMessage="Confirmations received from source blockchain."
            />
          </div>
          <DisplayProgressNew
            progressType={progress.success}
            ratio={getTransactionProgress(NUMBER_OF_BLOCKS_TO_SUCCESS, 'commitment_submitted')(
              burnStatus.status,
              burnStatus.commitment_txid_height,
              syncStatus,
            )}
            showOfflineWarning={syncStatus.mode === 'offline'}
          />
          <div className="progress">
            <ProvingProgressLabel
              progress={progress.success}
              label="Proving Successful"
              inProgressMessage="Proving underway."
              checkedMessage="Prover has successfully proved the burn transaction."
            />
          </div>
          <DisplayProgressNew
            progressType={progress.confirm}
            ratio={getTransactionProgress(NUMBER_OF_BLOCKS_TO_CONFIRM, 'redeem_submitted')(
              burnStatus.status,
              burnStatus.redeem_txid_height,
              syncStatus,
            )}
            showOfflineWarning={syncStatus.mode === 'offline'}
          />
          <div className="progress">
            <ProvingProgressLabel
              progress={progress.confirm}
              label={progress.confirm === 'STOPPED' ? 'Already Proved' : 'Proving Confirmed'}
              inProgressMessage="Waiting for confirmations on Midnight."
              checkedMessage="Burn Process complete. Midnight Tokens are now available."
              placement="topRight"
            />
          </div>
        </div>
      </div>
      <div className={classnames('burn-details', {active: detailsShown})}>
        <div className="burn-details-header">Burn Details</div>
        <div className="burn-details-info">
          <div>Burn address:</div>
          <div>
            <CopyableLongText content={burnWatcher.burnAddress} />
          </div>
          <div>Associated midnight address:</div>
          <div>
            <CopyableLongText content={burnAddressInfo.midnightAddress} />
          </div>
          <div>Prover:</div>
          <div>
            {burnWatcher.prover.name} ({burnWatcher.prover.address})
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
          Information about burn progress might be outdated. Gathering burn activity from prover
          &#34;{burnWatcher.prover.name}&#34; failed with the following error:
          <br />
          {errorMessage}
        </div>
      )}
    </div>
  )
}
