import React, {useState} from 'react'
import _ from 'lodash/fp'
import {Button, Dropdown, Menu, Icon} from 'antd'
import InfiniteScroll from 'react-infinite-scroller'
import * as record from 'fp-ts/lib/Record'
import {sort, map} from 'fp-ts/lib/Array'
import {Ord, ordString, ordNumber, ord, getDualOrd} from 'fp-ts/lib/Ord'
import {pipe} from 'fp-ts/lib/pipeable'
import {Transaction, TransparentAddress, Account} from '../web3'
import {WalletState} from '../common/wallet-state'
import {SendTransaction} from './modals/SendTransaction'
import {ReceiveTransactionPrivate} from './modals/ReceiveTransactionPrivate'
import {TransactionRow} from './TransactionRow'
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
      txStatus === 'pending' || txStatus === 'failed' || !txStatus.atBlock ? '' : txStatus.atBlock,
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
  const {transactions, accounts} = props

  const state = WalletState.useContainer()

  const [shownTxNumber, setShownTxNumber] = useState(20)
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

  const sortableHeader = (name: Property): JSX.Element => (
    <th onClick={changeOrder(name)} className="sortable">
      {sortableProperties[name].label}{' '}
      {sortBy.property === name && (
        <Icon type={sortBy.direction === 'asc' ? 'caret-up' : 'caret-down'} />
      )}
    </th>
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
          <ReceiveTransactionPrivate
            visible={showReceiveModal}
            privateAddress={accounts[0].address}
            onCancel={(): void => setShowReceiveModal(false)}
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
          <InfiniteScroll
            initialLoad={false}
            loadMore={() => setShownTxNumber(shownTxNumber + 10)}
            hasMore={transactions.length > shownTxNumber}
            useWindow={false}
            getScrollParent={() => document.getElementById('wallets')}
          >
            <table className="transactions">
              <thead>
                <tr className="header">
                  {sortableHeader('type')}
                  <th>Asset</th>
                  {sortableHeader('amount')}
                  {sortableHeader('time')}
                  {sortableHeader('status')}
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {pipe(
                  transactions,
                  sort(getOrd(sortBy)),
                  _.take(shownTxNumber),
                  map((tx: Transaction) => <TransactionRow transaction={tx} key={tx.hash} />),
                )}
              </tbody>
            </table>
          </InfiniteScroll>
        </div>
      )}
    </div>
  )
}
