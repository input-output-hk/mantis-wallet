import React from 'react'
import SVG from 'react-inlinesvg'
import BigNumber from 'bignumber.js'
import _ from 'lodash'
import {fromUnixTime} from 'date-fns'
import classnames from 'classnames'
import {RightOutlined} from '@ant-design/icons'
import {Popover} from 'antd'
import {Transaction, TxStatusString} from '../web3'
import {SettingsState, useFormatters} from '../settings-state'
import {GlacierState} from '../glacier-drop/glacier-state'
import {UNITS} from '../common/units'
import {ShortNumber} from '../common/ShortNumber'
import {LINKS} from '../external-link-config'
import {Link} from '../common/Link'
import {WalletState} from '../common/wallet-state'
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
        <span>{capitalizedStatus}</span>
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
  const {totalValue, fee} = processAmount(txValue)
  const displayValue = txDirection === 'incoming' ? totalValue : totalValue.multipliedBy(-1)

  return (
    <span className={classnames('amount', txDirection)}>
      <ShortNumber
        big={displayValue}
        showSign={true}
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

const DESCRIPTION_PER_TX_TYPE: Record<Transaction['txDetails']['txType'], string> = {
  redeem: 'A transfer transaction from a transparent address to a confidential address',
  call: 'A smart contract call transaction',
  transfer: 'A fully confidential transfer of funds',
  coinbase: 'A transfer of mining rewards',
}

const TxTypeLabel = ({
  transaction: {
    txDetails: {txType},
  },
}: TransactionCellProps): JSX.Element => {
  const typeLabel = `${_.capitalize(txType)} Transaction`
  return (
    <div className="type-label">
      <Popover content={DESCRIPTION_PER_TX_TYPE[txType]} placement="right">
        <span>{typeLabel}</span>
      </Popover>
    </div>
  )
}

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
    return wrapper('Glacier Drop Contract Call')
  } else {
    return <></>
  }
}

const TxDetailsTypeSpecific = ({transaction}: TransactionCellProps): JSX.Element => {
  switch (transaction.txDetails.txType) {
    case 'transfer':
    case 'coinbase':
    case 'redeem': {
      return <TxTypeLabel transaction={transaction} />
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
            <div>From:</div>
            <div className="monospace">{sendingAddress}</div>
            <div>To:</div>
            <div className="monospace">{receivingAddress}</div>
            <div>Gas Limit:</div>
            <div className="monospace">{new BigNumber(gasLimit).toString(10)}</div>
            <div>Gas Price:</div>
            <div className="monospace">{new BigNumber(gasPrice).toString(10)}</div>
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
        <Link href={`${LINKS.explorer}/transaction/${hash}`} styled>
          View in Explorer
        </Link>
      </div>
    </>
  )
}
