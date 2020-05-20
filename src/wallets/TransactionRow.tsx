import React from 'react'
import SVG from 'react-inlinesvg'
import BigNumber from 'bignumber.js'
import _ from 'lodash'
import {fromUnixTime} from 'date-fns'
import classnames from 'classnames'
import {Icon, Popover} from 'antd'
import {Transaction, TxStatusString} from '../web3'
import {ThemeState} from '../theme-state'
import {UNITS} from '../common/units'
import {ShortNumber} from '../common/ShortNumber'
import {Link} from '../common/Link'
import {WalletState} from '../common/wallet-state'
import {formatDate, abbreviateAmount} from '../common/formatters'
import dustIconDark from '../assets/dark/dust.png'
import dustIconLight from '../assets/light/dust.png'
import transparentIcon from '../assets/icons/transparent.svg'
import confidentialIcon from '../assets/icons/confidential.svg'
import checkIcon from '../assets/icons/check.svg'
import checkDoubleIcon from '../assets/icons/check-double.svg'
import clockIcon from '../assets/icons/clock.svg'
import crossIcon from '../assets/icons/cross.svg'
import './TransactionRow.scss'

export interface TransactionCellProps {
  transaction: Transaction
}

const ICON_PER_TX_STATUS: Record<TxStatusString, string> = {
  pending: clockIcon,
  confirmed: checkIcon,
  persisted: checkDoubleIcon,
  failed: crossIcon,
}

const DESCRIPTION_PER_TX_STATUS: Record<TxStatusString, string> = {
  pending: 'Transaction waiting to be added to a block in the Midnight Chain',
  confirmed: 'Transaction has been added to a block in the Midnight Chain',
  persisted: 'Transaction cannot be rolled back',
  failed: 'Transaction has failed to reach the chain and wallet doesn’t expect it to proceed',
}

export const TxStatusCell = ({transaction: {txStatus}}: TransactionCellProps): JSX.Element => {
  const status: TxStatusString = typeof txStatus === 'string' ? txStatus : txStatus.status
  const capitalizedStatus = _.capitalize(status)
  const iconSrc = ICON_PER_TX_STATUS[status]
  const description = DESCRIPTION_PER_TX_STATUS[status]

  return (
    <>
      <span className="icon">
        <SVG className={status} title={capitalizedStatus} src={iconSrc} />
      </span>
      <Popover content={description} placement="bottom">
        {capitalizedStatus}
      </Popover>
    </>
  )
}

export const TxTypeCell = ({
  transaction: {txDetails, txDirection},
}: TransactionCellProps): JSX.Element => {
  const displayDirection = txDirection === 'incoming' ? 'Received' : 'Sent'
  const isTransparent = txDetails.txType === 'call'

  const {icon, typeText} = isTransparent
    ? {
        icon: transparentIcon,
        typeText: 'Transparent',
      }
    : {
        icon: confidentialIcon,
        typeText: 'Confidential',
      }

  return (
    <>
      <div className="collapse-icon">
        <Icon type="right" />
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

const abbreviateDust = (big: BigNumber): string =>
  abbreviateAmount(UNITS.Dust.fromBasic(big)).relaxed

const DetailedAmount = ({transaction: {txValue}}: TransactionCellProps): JSX.Element => {
  const {value, fee, totalValue} = processAmount(txValue)

  return fee.isZero() ? (
    <></>
  ) : (
    <div className="DetailedAmount two-col-table">
      <div>Value:</div>
      <div className="monospace">{abbreviateDust(value)}</div>
      <div>Fee:</div>
      <div className="monospace">{abbreviateDust(fee)}</div>
      <div>Total:</div>
      <div className="monospace">{abbreviateDust(totalValue)}</div>
    </div>
  )
}

export const TxAmountCell = ({transaction}: TransactionCellProps): JSX.Element => {
  const {txValue, txDirection} = transaction
  const {totalValue} = processAmount(txValue)
  const displayValue = txDirection === 'incoming' ? totalValue : totalValue.multipliedBy(-1)

  return (
    <span className={classnames('amount', txDirection)}>
      <ShortNumber
        big={displayValue}
        showSign={true}
        content={txDirection === 'outgoing' && <DetailedAmount transaction={transaction} />}
      />
    </span>
  )
}

export const TxTimeCell = ({transaction: {txStatus}}: TransactionCellProps): JSX.Element => {
  const dateString =
    txStatus === 'pending' || txStatus === 'failed'
      ? ''
      : formatDate(fromUnixTime(txStatus.timestamp))

  return <>{dateString}</>
}

export const TxAssetCell = ({}: TransactionCellProps): JSX.Element => {
  const themeState = ThemeState.useContainer()
  const dustIcon = themeState.theme === 'dark' ? dustIconDark : dustIconLight

  return (
    <>
      <img src={dustIcon} alt="dust" className="dust" />
      <span>DUST</span>
    </>
  )
}

const TxDetailsTypeSpecific = ({transaction: {txDetails}}: TransactionCellProps): JSX.Element => {
  const typeLabel = `${_.capitalize(txDetails.txType)} Transaction`
  switch (txDetails.txType) {
    case 'transfer': {
      return <div className="type-label">{typeLabel}</div>
    }
    case 'coinbase': {
      return <div className="type-label">{typeLabel}</div>
    }
    case 'redeem': {
      return <div className="type-label">{typeLabel}</div>
    }
    case 'call': {
      const {
        sendingAddress,
        receivingAddress,
        gasLimit,
        gasPrice,
      } = txDetails.transparentTransaction
      return (
        <div>
          <div className="type-label">{typeLabel}</div>
          <div className="call-details two-col-table">
            <div>From:</div>
            <div className="monospace">{sendingAddress}</div>
            <div>To:</div>
            <div className="monospace">{receivingAddress}</div>
            <div>Gas Limit:</div>
            <div className="monospace">{gasLimit}</div>
            <div>Gas Price:</div>
            <div className="monospace">{gasPrice}</div>
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
      Confirmations: <b>{confirmations}</b>
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
        Transaction ID: <span className="monospace">{hash}</span>
        <br />
        <Link href={`https://explorer.testnet-pupa.project42.iohkdev.io/transaction/${hash}`}>
          View in Explorer
        </Link>
      </div>
    </>
  )
}
