import React, {useState} from 'react'
import SVG from 'react-inlinesvg'
import Big from 'big.js'
import {Button, Dropdown, Menu, Icon} from 'antd'
import _ from 'lodash'
import * as record from 'fp-ts/lib/Record'
import {sort} from 'fp-ts/lib/Array'
import {Ord, ordString, ordNumber, ord, getDualOrd} from 'fp-ts/lib/Ord'
import {pipe} from 'fp-ts/lib/pipeable'
import {Transaction, TransparentAddress, Account} from '../web3'
import {WalletState} from '../common/wallet-state'
import {ShortNumber} from '../common/ShortNumber'
import {SendTransaction} from './modals/SendTransaction'
import {ReceiveTransaction} from './modals/ReceiveTransaction'
import dustLogo from '../assets/dust_logo.png'
import incomingIcon from '../assets/icons/incoming.svg'
import outgoingIcon from '../assets/icons/outgoing.svg'
import transparentIcon from '../assets/icons/transparent.svg'
import confidentialIcon from '../assets/icons/confidential.svg'
import checkIcon from '../assets/icons/check.svg'
import arrowDownIcon from '../assets/icons/arrow-down.svg'
import './TransactionHistory.scss'

interface TransactionHistoryProps {
  transactions: Transaction[]
  transparentAddresses: TransparentAddress[]
  accounts: Account[]
}

type Property = 'type' | 'amount' | 'time' | 'status' | 'direction'
type Direction = 'asc' | 'desc'

interface SortBy {
  property: Property
  direction: Direction
}

interface PropertyConfig {
  label: string
  order: Ord<Transaction>
}

const sortableProperties: Record<Property, PropertyConfig> = {
  type: {
    label: 'Type',
    order: ord.contramap(ordString, ({txDetails}: Transaction) => txDetails.txType),
  },
  direction: {
    label: 'Direction',
    order: ord.contramap(ordString, ({txDirection}: Transaction) => txDirection),
  },
  amount: {
    label: 'Amount',
    order: ord.contramap(ordNumber, ({txValue}: Transaction) =>
      parseInt(typeof txValue === 'string' ? txValue : txValue.value),
    ),
  },
  time: {
    label: 'Time',
    order: ord.contramap(ordString, ({txStatus}: Transaction) =>
      txStatus === 'pending' || !txStatus.atBlock ? '' : txStatus.atBlock,
    ),
  },
  status: {
    label: 'Status',
    order: ord.contramap(ordString, ({txStatus}: Transaction) =>
      typeof txStatus === 'string' ? txStatus : txStatus.status,
    ),
  },
}

const updateSorting = (currentSortBy: SortBy, nextProperty: Property): SortBy => {
  if (currentSortBy.property === nextProperty) {
    // when it is clicked on the same property by which the list is ordered by
    // then the direction of ordering is changed
    const direction = currentSortBy.direction === 'asc' ? 'desc' : 'asc'
    return {property: nextProperty, direction}
  } else {
    // otherwise the list is ordered in ascending order by the new property
    return {property: nextProperty, direction: 'asc'}
  }
}

const getOrd = (sortBy: SortBy): Ord<Transaction> =>
  sortBy.direction === 'asc'
    ? sortableProperties[sortBy.property].order
    : getDualOrd(sortableProperties[sortBy.property].order)

export const TransactionHistory = (props: TransactionHistoryProps): JSX.Element => {
  const {transactions, transparentAddresses, accounts} = props

  const state = WalletState.useContainer()

  const [showSendModal, setShowSendModal] = useState(false)
  const [showReceiveModal, setShowReceiveModal] = useState(false)

  const [sortBy, setSortBy] = useState<SortBy>({
    property: 'time',
    direction: 'asc',
  })

  const changeOrder = (property: Property) => (): void => setSortBy(updateSorting(sortBy, property))

  const sortByMenu = (
    <Menu>
      {record.toArray(sortableProperties).map(([name, config]) => {
        return (
          <Menu.Item key={name} onClick={changeOrder(name)}>
            {sortBy.property === name && (
              <Icon type={sortBy.direction === 'asc' ? 'caret-up' : 'caret-down'} />
            )}
            {config.label}
          </Menu.Item>
        )
      })}
    </Menu>
  )

  return (
    <div className="TransactionHistory">
      <div className="toolbar">
        <div className="title">Transaction History</div>
        <div className="line"></div>
        <div>
          <Dropdown overlay={sortByMenu} overlayClassName="SortByDropdown">
            <span className="sort-by">Sort by ▼ </span>
          </Dropdown>
          <Button
            data-testid="send-button"
            type="primary"
            className="action"
            onClick={(): void => setShowSendModal(true)}
          >
            Send
          </Button>
          <Button
            data-testid="receive-button"
            type="primary"
            className="action"
            onClick={(): void => setShowReceiveModal(true)}
          >
            Receive
          </Button>
          <SendTransaction
            visible={showSendModal}
            accounts={accounts}
            onCancel={(): void => setShowSendModal(false)}
            onSend={async (recipient: string, amount: number, fee: number): Promise<void> => {
              if (state.walletStatus === 'LOADED') {
                await state.sendTransaction(recipient, amount, fee)
                setShowSendModal(false)
              }
            }}
          />
          <ReceiveTransaction
            visible={showReceiveModal}
            transparentAddresses={transparentAddresses}
            onCancel={(): void => setShowReceiveModal(false)}
            onGenerateNew={async (): Promise<void> => {
              if (state.walletStatus === 'LOADED') {
                await state.generateNewAddress()
              }
            }}
          />
        </div>
      </div>
      {transactions.length === 0 && (
        <div className="no-transactions">
          <div className="no-transactions-text">You haven&apos;t made a transaction</div>
        </div>
      )}
      {transactions.length > 0 && (
        <div className="transactions-container">
          <table className="transactions">
            <thead>
              <tr className="header">
                <th></th>
                <th>Asset</th>
                <th>Amount</th>
                <th>Time</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {pipe(transactions, sort(getOrd(sortBy))).map(
                ({hash, txDetails, txDirection, txStatus, txValue}) => {
                  const value = typeof txValue === 'string' ? txValue : txValue.value
                  const status = typeof txStatus === 'string' ? txStatus : txStatus.status
                  const atBlock = txStatus === 'pending' ? '' : txStatus.atBlock
                  return (
                    <tr key={hash}>
                      <td className="line">
                        <span className="type-icon">
                          &nbsp;
                          {txDetails.txType === 'call' && (
                            <SVG src={transparentIcon} className="svg" title="Transparent" />
                          )}
                          {txDetails.txType !== 'call' && (
                            <SVG src={confidentialIcon} className="svg" title="Confidential" />
                          )}
                        </span>
                      </td>
                      <td className="line">
                        <img src={dustLogo} alt="dust" className="dust" />
                        <span>DUST</span>
                      </td>
                      <td className="line">
                        <span className="amount">
                          {txDirection === 'incoming' && (
                            <SVG src={incomingIcon} className="svg" title="Incoming" />
                          )}
                          {txDirection === 'outgoing' && (
                            <SVG src={outgoingIcon} className="svg" title="Outgoing" />
                          )}
                          &nbsp;
                          <ShortNumber big={Big(parseInt(value))} />
                        </span>
                      </td>
                      {/* FIXME: get proper date from transaction */}
                      <td className="line">{atBlock}</td>
                      <td className="line">
                        {status === 'confirmed' && (
                          <>
                            <SVG src={checkIcon} className="check" title="Confirmed" />
                            &nbsp;
                          </>
                        )}
                        {_.capitalize(status)}
                      </td>
                      <td className="line">
                        <SVG src={arrowDownIcon} className="svg" />
                      </td>
                    </tr>
                  )
                },
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
