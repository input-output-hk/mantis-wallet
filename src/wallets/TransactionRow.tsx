import React from 'react'
import SVG from 'react-inlinesvg'
import BigNumber from 'bignumber.js'
import _ from 'lodash'
import {fromUnixTime} from 'date-fns'
import classnames from 'classnames'
import {RightOutlined} from '@ant-design/icons'
import {Popover} from 'antd'
import {Transaction, TxStatusString, CallTxDetails} from '../web3'
import {SettingsState, useFormatters, useTranslation} from '../settings-state'
import {GlacierState} from '../glacier-drop/glacier-state'
import {UNITS} from '../common/units'
import {ShortNumber} from '../common/ShortNumber'
import {LINKS} from '../external-link-config'
import {Link} from '../common/Link'
import {WalletState, TransactionStatus} from '../common/wallet-state'
import {TKeyRenderer} from '../common/i18n'
import {Trans} from '../common/Trans'
import dustIconDark from '../assets/dark/dust.png'
import dustIconLight from '../assets/light/dust.png'
import transparentIcon from '../assets/icons/transparent.svg'
import confidentialIcon from '../assets/icons/confidential.svg'
import checkIcon from '../assets/icons/check.svg'
import checkDoubleIcon from '../assets/icons/check-double.svg'
import clockIcon from '../assets/icons/clock.svg'
import crossIcon from '../assets/icons/cross.svg'
import glacierIcon from '../assets/icons/menu-glacier.svg'
import './TransactionRow.scss'

interface ExtendedCallTxDetails extends CallTxDetails {
  callTxStatus: TransactionStatus
}

export type ExtendedTransaction = Transaction &
  (
    | {
        txDetails: ExtendedCallTxDetails
      }
    | {
        txDetails: {
          txType: Exclude<Transaction['txDetails']['txType'], 'call'>
        }
      }
  )

export interface TransactionCellProps {
  transaction: ExtendedTransaction
}

type TxVisibleStatus = TxStatusString | 'failedToExecute'

const ICON_PER_TX_STATUS: Record<TxVisibleStatus, string> = {
  pending: clockIcon,
  confirmed: checkIcon,
  persisted: checkDoubleIcon,
  failed: crossIcon,
  failedToExecute: crossIcon,
}

const DESCRIPTION_PER_TX_STATUS: Record<TxVisibleStatus, TKeyRenderer> = {
  pending: ['wallet', 'transactionStatus', 'pendingDescription'],
  confirmed: ['wallet', 'transactionStatus', 'confirmedDescription'],
  persisted: ['wallet', 'transactionStatus', 'persistedDescription'],
  failed: ['wallet', 'transactionStatus', 'failedDescription'],
  failedToExecute: ['wallet', 'transactionStatus', 'failedToExecuteDescription'],
}

const TX_STATUS_TRANSLATION: Record<TxVisibleStatus, TKeyRenderer> = {
  pending: ['wallet', 'transactionStatus', 'pending'],
  confirmed: ['wallet', 'transactionStatus', 'confirmed'],
  persisted: ['wallet', 'transactionStatus', 'persisted'],
  failed: ['wallet', 'transactionStatus', 'failed'],
  failedToExecute: ['wallet', 'transactionStatus', 'failedToExecute'],
}

const getVisibleStatus = ({txStatus, txDetails}: ExtendedTransaction): TxVisibleStatus => {
  if (txDetails.txType === 'call' && txDetails.callTxStatus.status === 'TransactionFailed') {
    return 'failedToExecute'
  }
  return typeof txStatus === 'string' ? txStatus : txStatus.status
}

export const TxStatusCell = ({transaction}: TransactionCellProps): JSX.Element => {
  const status = getVisibleStatus(transaction)
  const nonPersisted =
    status === 'failedToExecute' &&
    typeof transaction.txStatus !== 'string' &&
    transaction.txStatus.status === 'confirmed'

  return (
    <>
      <Popover
        content={
          <>
            <Trans k={DESCRIPTION_PER_TX_STATUS[status]} />
            {nonPersisted && (
              <>
                <br />
                <Trans k={['wallet', 'transactionStatus', 'notPersistedDescription']} />
              </>
            )}
          </>
        }
        placement="bottom"
      >
        <span>
          <span className="icon">
            <SVG className={classnames(status, {nonPersisted})} src={ICON_PER_TX_STATUS[status]} />
          </span>
          <Trans k={TX_STATUS_TRANSLATION[status]} />
        </span>
      </Popover>
    </>
  )
}

const TX_DIRECTION_TRANSLATION: Record<Transaction['txDirection'], TKeyRenderer> = {
  incoming: ['wallet', 'transactionType', 'received'],
  outgoing: ['wallet', 'transactionType', 'sent'],
  internal: ['wallet', 'transactionType', 'internal'],
}

export const TxTypeCell = ({
  transaction: {txDetails, txDirection},
}: TransactionCellProps): JSX.Element => {
  const {t} = useTranslation()

  const displayDirection = t(TX_DIRECTION_TRANSLATION[txDirection])
  const isTransparent = txDetails.txType === 'call'

  const {icon, typeText} = isTransparent
    ? {
        icon: transparentIcon,
        typeText: t(['wallet', 'transactionType', 'transparent']),
      }
    : {
        icon: confidentialIcon,
        typeText: t(['wallet', 'transactionType', 'confidential']),
      }

  return (
    <>
      <div className="collapse-icon">
        <RightOutlined />
      </div>
      <span className="icon">
        <SVG src={icon} className="svg" title={typeText} />
      </span>
      {displayDirection} {typeText}
    </>
  )
}

const processAmount = (
  txValue: Transaction['txValue'],
): {value: BigNumber; fee: BigNumber; totalValue: BigNumber} => {
  const {value, fee} = _.mapValues(
    typeof txValue === 'string' ? {value: txValue, fee: '0'} : txValue,
    (str) => new BigNumber(str),
  )
  const totalValue = value.plus(fee)
  return {value, fee, totalValue}
}

const DetailedAmount = ({transaction: {txValue}}: TransactionCellProps): JSX.Element => {
  const {abbreviateAmount} = useFormatters()
  const {value, fee, totalValue} = processAmount(txValue)
  const abbreviateDust = (big: BigNumber): string =>
    abbreviateAmount(UNITS.Dust.fromBasic(big)).relaxed

  return fee.isZero() ? (
    <></>
  ) : (
    <div className="DetailedAmount two-col-table">
      <div>
        <Trans k={['wallet', 'label', 'transactionValue']} />:
      </div>
      <div className="monospace">{abbreviateDust(value)}</div>
      <div>
        <Trans k={['wallet', 'label', 'transactionFee']} />:
      </div>
      <div className="monospace">{abbreviateDust(fee)}</div>
      <div>
        <Trans k={['wallet', 'label', 'transactionTotal']} />:
      </div>
      <div className="monospace">{abbreviateDust(totalValue)}</div>
    </div>
  )
}

export const TxAmountCell = ({transaction}: TransactionCellProps): JSX.Element => {
  const {txValue, txDirection} = transaction
  const {totalValue, fee} = processAmount(txValue)
  const displayValue = txDirection === 'outgoing' ? totalValue.multipliedBy(-1) : totalValue

  return (
    <span className={classnames('amount', txDirection)}>
      <ShortNumber
        big={displayValue}
        showSign={txDirection !== 'internal'}
        content={
          txDirection === 'outgoing' && !fee.isZero() ? (
            <DetailedAmount transaction={transaction} />
          ) : null
        }
      />
    </span>
  )
}

export const TxTimeCell = ({transaction: {txStatus}}: TransactionCellProps): JSX.Element => {
  const {formatDate} = useFormatters()

  const dateString =
    txStatus === 'pending' || txStatus === 'failed'
      ? ''
      : formatDate(fromUnixTime(txStatus.timestamp))

  return <>{dateString}</>
}

export const TxAssetCell = ({}: TransactionCellProps): JSX.Element => {
  const {theme} = SettingsState.useContainer()
  const dustIcon = theme === 'dark' ? dustIconDark : dustIconLight

  return (
    <>
      <img src={dustIcon} alt="dust" className="dust" />
      <span>DUST</span>
    </>
  )
}

const DESCRIPTION_PER_TX_TYPE: Record<Transaction['txDetails']['txType'], TKeyRenderer> = {
  redeem: ['wallet', 'transactionType', 'redeemDescription'],
  call: ['wallet', 'transactionType', 'callDescription'],
  transfer: ['wallet', 'transactionType', 'transferDescription'],
  coinbase: ['wallet', 'transactionType', 'coinbaseDescription'],
}

const LABEL_PER_TX_TYPE: Record<Transaction['txDetails']['txType'], TKeyRenderer> = {
  redeem: ['wallet', 'transactionType', 'redeem'],
  call: ['wallet', 'transactionType', 'call'],
  transfer: ['wallet', 'transactionType', 'transfer'],
  coinbase: ['wallet', 'transactionType', 'coinbase'],
}

const TxTypeLabel = ({
  transaction: {
    txDetails: {txType},
  },
}: TransactionCellProps): JSX.Element => (
  <div className="type-label">
    <Popover content={<Trans k={DESCRIPTION_PER_TX_TYPE[txType]} />} placement="right">
      <span>
        <Trans k={LABEL_PER_TX_TYPE[txType]} />
      </span>
    </Popover>
  </div>
)

interface TxGlacierTypeLabel {
  receivingAddress: string | null
}

const TxGlacierTypeLabel = ({receivingAddress}: TxGlacierTypeLabel): JSX.Element => {
  const {
    contractAddresses: {glacierDrop},
  } = GlacierState.useContainer()

  const wrapper = (content: React.ReactNode): JSX.Element => {
    return (
      <div className="type-label">
        <SVG className="svg glacier-icon" src={glacierIcon} />
        &nbsp;{content}
      </div>
    )
  }

  if (receivingAddress === glacierDrop) {
    return wrapper(<Trans k={['wallet', 'transactionType', 'glacierDropContractCall']} />)
  } else {
    return <></>
  }
}

const CallTxStatus = ({callTxStatus}: {callTxStatus: TransactionStatus}): JSX.Element => {
  if (callTxStatus.status === 'TransactionPending' || callTxStatus.message === '') {
    return <></>
  }

  return (
    <>
      <div>
        <Trans k={['wallet', 'label', 'contractCallMessage']} />
      </div>
      <div
        className={classnames(
          'monospace',
          callTxStatus.status === 'TransactionFailed' ? 'failure' : 'success',
        )}
      >
        {callTxStatus.message}
      </div>
    </>
  )
}

const TxDetailsTypeSpecific = ({transaction}: TransactionCellProps): JSX.Element => {
  switch (transaction.txDetails.txType) {
    case 'coinbase':
    case 'redeem': {
      return <TxTypeLabel transaction={transaction} />
    }
    case 'transfer': {
      return (
        <div>
          <TxTypeLabel transaction={transaction} />
          {transaction.txDetails.memo && (
            <div className="call-details two-col-table">
              <div>
                <Trans k={['wallet', 'label', 'encryptedMemo']} />:
              </div>
              <div className="monospace">{transaction.txDetails.memo[1]}</div>
            </div>
          )}
        </div>
      )
    }
    case 'call': {
      const {
        sendingAddress,
        receivingAddress,
        gasLimit,
        gasPrice,
      } = transaction.txDetails.transparentTransaction
      return (
        <div>
          <TxGlacierTypeLabel receivingAddress={receivingAddress} />
          <TxTypeLabel transaction={transaction} />
          <div className="call-details two-col-table">
            <div>
              <Trans k={['wallet', 'label', 'sendingAddress']} />:
            </div>
            <div className="monospace">{sendingAddress}</div>
            <div>
              <Trans k={['wallet', 'label', 'receivingAddress']} />:
            </div>
            <div className="monospace">{receivingAddress}</div>
            <div>
              <Trans k={['wallet', 'label', 'transactionGasLimit']} />:
            </div>
            <div className="monospace">{new BigNumber(gasLimit).toString(10)}</div>
            <div>
              <Trans k={['wallet', 'label', 'transactionGasPrice']} />:
            </div>
            <div className="monospace">{new BigNumber(gasPrice).toString(10)}</div>
            <CallTxStatus callTxStatus={transaction.txDetails.callTxStatus} />
          </div>
        </div>
      )
    }
  }
}

const Confirmations = ({transaction: {txStatus}}: TransactionCellProps): JSX.Element => {
  const walletState = WalletState.useContainer()

  if (
    typeof txStatus === 'string' ||
    walletState.walletStatus !== 'LOADED' ||
    walletState.syncStatus.mode !== 'online'
  )
    return <></>

  const confirmations = walletState.syncStatus.highestKnownBlock - parseInt(txStatus.atBlock, 16)

  return (
    <div>
      <Trans k={['wallet', 'label', 'transactionConfirmations']} />: <b>{confirmations}</b>
    </div>
  )
}

export const TxDetailsCell = ({transaction}: TransactionCellProps): JSX.Element => {
  const {hash} = transaction
  return (
    <>
      <TxDetailsTypeSpecific transaction={transaction} />
      <Confirmations transaction={transaction} />
      <DetailedAmount transaction={transaction} />
      <div>
        <Trans k={['wallet', 'label', 'transactionId']} />:{' '}
        <span className="monospace">{hash}</span>
        <br />
        <Link href={`${LINKS.explorer}/transaction/${hash}`} styled>
          <Trans k={['wallet', 'link', 'viewInExplorer']} />
        </Link>
      </div>
    </>
  )
}
