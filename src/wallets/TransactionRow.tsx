import React from 'react'
import SVG from 'react-inlinesvg'
import classnames from 'classnames'
import {RightOutlined} from '@ant-design/icons'
import {Popover} from 'antd'
import {useFormatters} from '../settings-state'
import {ETC_CHAIN} from '../common/chains'
import {ShortNumber} from '../common/ShortNumber'
import {EXPLORER_LINKS_FOR_TX} from '../external-link-config'
import {isDefinedNetworkName} from '../config/type'
import {Link} from '../common/Link'
import {WalletState, Transaction} from '../common/wallet-state'
import {BackendState} from '../common/backend-state'
import {TKeyRenderer} from '../common/i18n'
import {Trans} from '../common/Trans'
import {Address} from '../address-book/Address'
import {Wei, asWei, etherValue} from '../common/units'
import checkIcon from '../assets/icons/check.svg'
import checkDoubleIcon from '../assets/icons/check-double.svg'
import clockIcon from '../assets/icons/clock.svg'
import crossIcon from '../assets/icons/cross.svg'
import './TransactionRow.scss'

export interface TransactionCellProps {
  transaction: Transaction
}

const ICON_PER_TX_STATUS: Record<Transaction['status'], string> = {
  pending: clockIcon,
  confirmed: checkIcon,
  persisted: checkDoubleIcon,
  failed: crossIcon,
}

const DESCRIPTION_PER_TX_STATUS: Record<Transaction['status'], TKeyRenderer> = {
  pending: ['wallet', 'transactionStatus', 'pendingDescription'],
  confirmed: ['wallet', 'transactionStatus', 'confirmedDescription'],
  persisted: ['wallet', 'transactionStatus', 'persistedDescription'],
  failed: ['wallet', 'transactionStatus', 'failedDescription'],
}

const TX_STATUS_TRANSLATION: Record<Transaction['status'], TKeyRenderer> = {
  pending: ['wallet', 'transactionStatus', 'pending'],
  confirmed: ['wallet', 'transactionStatus', 'confirmed'],
  persisted: ['wallet', 'transactionStatus', 'persisted'],
  failed: ['wallet', 'transactionStatus', 'failed'],
}

export const TxStatusCell = ({transaction: {status}}: TransactionCellProps): JSX.Element => {
  const nonPersisted = status === 'confirmed'

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

const TX_DIRECTION_TRANSLATION: Record<Transaction['direction'], TKeyRenderer> = {
  incoming: ['wallet', 'transactionType', 'received'],
  outgoing: ['wallet', 'transactionType', 'sent'],
}

export const TxTypeCell = ({transaction: {direction}}: TransactionCellProps): JSX.Element => {
  return (
    <>
      <div className="collapse-icon">
        <RightOutlined />
      </div>
      <Trans k={TX_DIRECTION_TRANSLATION[direction]} />
    </>
  )
}

const DetailedAmount = ({transaction}: TransactionCellProps): JSX.Element | null => {
  const {abbreviateAmount} = useFormatters()
  const {value, fee} = transaction
  const totalValue = value.plus(fee)
  const abbreviate = (wei: Wei): string => abbreviateAmount(etherValue(wei)).relaxed

  return fee.isZero() ? null : (
    <div className="DetailedAmount two-col-table">
      <div>
        <Trans k={['wallet', 'label', 'transactionValue']} />:
      </div>
      <div className="monospace">{abbreviate(value)}</div>
      <div>
        <Trans k={['wallet', 'label', 'transactionFee']} />:
      </div>
      <div className="monospace">{abbreviate(fee)}</div>
      <div>
        <Trans k={['wallet', 'label', 'transactionTotal']} />:
      </div>
      <div className="monospace">{abbreviate(asWei(totalValue))}</div>
    </div>
  )
}

export const TxAmountCell = ({transaction}: TransactionCellProps): JSX.Element => {
  const {value, fee, direction} = transaction
  const totalValue = value.plus(fee)
  const displayValue = direction === 'outgoing' ? totalValue.multipliedBy(-1) : totalValue

  return (
    <span className={classnames('amount', direction)}>
      <ShortNumber
        big={displayValue}
        showSign
        content={<DetailedAmount transaction={transaction} />}
      />
    </span>
  )
}

export const TxTimeCell = ({transaction: {timestamp}}: TransactionCellProps): JSX.Element => {
  const {formatDate} = useFormatters()
  return timestamp === null ? <></> : <>{formatDate(timestamp)}</>
}

export const TxAssetCell = ({}: TransactionCellProps): JSX.Element => {
  return (
    <>
      <SVG src={ETC_CHAIN.logo} title={ETC_CHAIN.symbol} className="asset-icon svg" />
      <span>{ETC_CHAIN.symbol}</span>
    </>
  )
}

const Confirmations = ({transaction: {blockNumber}}: TransactionCellProps): JSX.Element => {
  const walletState = WalletState.useContainer()

  if (
    blockNumber === null ||
    walletState.walletStatus !== 'LOADED' ||
    walletState.syncStatus.mode !== 'online'
  )
    return <></>

  const confirmations = walletState.syncStatus.highestKnownBlock - blockNumber

  return (
    <div>
      <Trans k={['wallet', 'label', 'transactionConfirmations']} />: <b>{confirmations}</b>
    </div>
  )
}

export const TxDetailsCell = ({transaction}: TransactionCellProps): JSX.Element => {
  const {hash, from, to, gas, gasPrice, gasUsed} = transaction
  const {networkName} = BackendState.useContainer()
  return (
    <>
      <div className="call-details two-col-table">
        <div>
          <Trans k={['wallet', 'label', 'sendingAddress']} />:
        </div>
        <div className="monospace">
          <Address address={from} />
        </div>
        <div>
          <Trans k={['wallet', 'label', 'receivingAddress']} />:
        </div>
        <div className="monospace">
          <Address address={to ?? ''} />
        </div>
        <div>
          <Trans k={['wallet', 'label', 'transactionGasLimit']} />:
        </div>
        <div className="monospace">{gas.toString(10)}</div>
        {gasUsed !== null && (
          <>
            <div>
              <Trans k={['wallet', 'label', 'transactionGasUsed']} />:
            </div>
            <div className="monospace">{gasUsed.toString(10)}</div>
          </>
        )}
        <div>
          <Trans k={['wallet', 'label', 'transactionGasPrice']} />:
        </div>
        <div className="monospace">{gasPrice.toString(10)}</div>
      </div>
      <Confirmations transaction={transaction} />
      <DetailedAmount transaction={transaction} />
      <div>
        <Trans k={['wallet', 'label', 'transactionId']} />:{' '}
        <span className="monospace">{hash}</span>
        {isDefinedNetworkName(networkName) && (
          <>
            <br />
            <Link href={EXPLORER_LINKS_FOR_TX[networkName](hash)} styled>
              <Trans k={['wallet', 'link', 'viewInExplorer']} />
            </Link>
          </>
        )}
      </div>
    </>
  )
}
