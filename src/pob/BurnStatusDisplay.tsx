import React, {ReactNode, useState, useEffect} from 'react'
import BigNumber from 'bignumber.js'
import SVG from 'react-inlinesvg'
import {
  CloseOutlined,
  LoadingOutlined,
  RightOutlined,
  EyeInvisibleOutlined,
  EyeOutlined,
} from '@ant-design/icons'
import {Popover} from 'antd'
import {TooltipPlacement} from 'antd/lib/tooltip'
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
import {ProgressState, ProgressBar} from '../common/ProgressBar'
import './BurnStatusDisplay.scss'
import {useFormatters} from '../common/i18n-hooks'

interface AllProgress {
  started: ProgressState
  success: ProgressState
  confirm: ProgressState
}

interface BurnStatusDisplayProps extends Pick<ProofOfBurnData, 'hideBurnProcess'> {
  burnWatcher: BurnWatcher
  burnAddressInfo: BurnAddressInfo
  syncStatus: SynchronizationStatus
  burnStatus: RealBurnStatus
  errorMessage?: string
}

const STATUS_TO_PROGRESS: Record<BurnStatusType, AllProgress> = {
  tx_found: {started: 'inProgress', success: 'unknown', confirm: 'unknown'},
  commitment_submitted: {started: 'checked', success: 'inProgress', confirm: 'unknown'},
  proof_fail: {started: 'fail', success: 'fail', confirm: 'fail'},
  commitment_appeared: {
    started: 'checked',
    success: 'inProgress',
    confirm: 'unknown',
  },
  redeem_submitted: {
    started: 'checked',
    success: 'checked',
    confirm: 'inProgress',
  },
  commitment_fail: {
    started: 'checked',
    success: 'fail',
    confirm: 'fail',
  },
  redeem_appeared: {
    started: 'checked',
    success: 'checked',
    confirm: 'inProgress',
  },
  redeem_fail: {
    started: 'checked',
    success: 'checked',
    confirm: 'fail',
  },
  redeem_another_prover: {
    started: 'checked',
    success: 'checked',
    confirm: 'stopped',
  },
}

const PROGRESS_ICONS: Record<ProgressState, ReactNode> = {
  checked: <SVG src={checkIcon} className="checked icon" title="Checked" />,
  unknown: <CloseOutlined className="unknown icon" title="Unknown" />,
  fail: <CloseOutlined className="fail icon" title="Failed" />,
  inProgress: <SVG src={refreshIcon} className="inProgress icon" title="In progress" />,
  stopped: <SVG src={circleIcon} className="stopped icon" title="Stopped" />,
}

const ProvingProgressLabel = ({
  progress,
  label,
  inProgressMessage,
  checkedMessage,
  placement = 'top',
}: {
  progress: ProgressState
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

  if (progress === 'inProgress' || progress === 'checked' || progress === 'stopped') {
    return (
      <Popover
        content={progress === 'inProgress' ? inProgressMessage : checkedMessage}
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

export const BurnStatusDisplay: React.FunctionComponent<BurnStatusDisplayProps> = ({
  burnWatcher,
  hideBurnProcess,
  burnAddressInfo,
  syncStatus,
  burnStatus,
  errorMessage,
}: BurnStatusDisplayProps) => {
  const {formatDate} = useFormatters()
  const [hidingProgress, setHidingProgress] = useState<{to: boolean} | 'persisted'>('persisted')
  const [detailsShown, setDetailsShown] = useState(false)

  useEffect(() => {
    if (hidingProgress !== 'persisted' && hidingProgress.to === burnStatus.isHidden) {
      setHidingProgress('persisted')
    }
  }, [burnStatus.isHidden])

  const chain = CHAINS[burnAddressInfo.chainId]
  const progress: AllProgress = isRedeemDone(syncStatus, burnStatus.redeem_tx_height)
    ? {
        started: 'checked',
        success: 'checked',
        confirm: 'checked',
      }
    : STATUS_TO_PROGRESS[burnStatus.status]

  const txFoundDate = burnStatus.timestamps?.tx_found && formatDate(burnStatus.timestamps.tx_found)
  const provingStartedDate =
    burnStatus.timestamps?.commitment_submitted &&
    formatDate(burnStatus.timestamps.commitment_submitted)
  const provingSuccessDate =
    burnStatus.timestamps?.redeem_submitted && formatDate(burnStatus.timestamps.redeem_submitted)
  const provingConfirmedDate =
    burnStatus.redeem_tx_timestamp && formatDate(burnStatus.redeem_tx_timestamp)

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
              <span>{PROGRESS_ICONS['checked']} Found Transaction</span>
            </Popover>
            {txFoundDate && <span className="step-date">{txFoundDate}</span>}
          </div>
          <ProgressBar
            progressState={progress.started}
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
            {provingStartedDate && <span className="step-date">{provingStartedDate}</span>}
          </div>
          <ProgressBar
            progressState={progress.success}
            ratio={getTransactionProgress(NUMBER_OF_BLOCKS_TO_SUCCESS, 'commitment_submitted')(
              burnStatus.status,
              burnStatus.commitment_tx_height,
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
            {provingSuccessDate && <span className="step-date">{provingSuccessDate}</span>}
          </div>
          <ProgressBar
            progressState={progress.confirm}
            ratio={getTransactionProgress(NUMBER_OF_BLOCKS_TO_CONFIRM, 'redeem_submitted')(
              burnStatus.status,
              burnStatus.redeem_tx_height,
              syncStatus,
            )}
            showOfflineWarning={syncStatus.mode === 'offline'}
          />
          <div className="progress">
            <ProvingProgressLabel
              progress={progress.confirm}
              label={progress.confirm === 'stopped' ? 'Already Proved' : 'Proving Confirmed'}
              inProgressMessage="Waiting for confirmations on Midnight."
              checkedMessage="Burn Process complete. Midnight Tokens are now available."
              placement="topRight"
            />
            {provingConfirmedDate && <span className="step-date last">{provingConfirmedDate}</span>}
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
