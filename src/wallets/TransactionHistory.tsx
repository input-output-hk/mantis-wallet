import React, {useState} from 'react'
import {CaretUpFilled, CaretDownFilled} from '@ant-design/icons'
import {Button, Dropdown, Menu} from 'antd'
import InfiniteScroll from 'react-infinite-scroller'
import {SendTransactionFlow} from './modals/SendTransaction'
import {ReceiveTransaction} from './modals/ReceiveTransaction'
import {
  TransactionList,
  updateSorting,
  SortBy,
  columns,
  SortableColumnConfig,
} from './TransactionList'
import {Trans} from '../common/Trans'
import {Wei} from '../common/units'
import {Transaction, FeeEstimates, Account} from '../common/wallet-state'

import './TransactionHistory.scss'

export interface TransactionHistoryProps {
  transactions: Transaction[]
  accounts: Account[]
  availableBalance: Wei
  estimateTransactionFee: () => Promise<FeeEstimates>
  generateAddress: () => Promise<void>
}

export const TransactionHistory = ({
  transactions,
  availableBalance,
  estimateTransactionFee,
  generateAddress,
  accounts,
}: TransactionHistoryProps): JSX.Element => {
  const [shownTxNumber, setShownTxNumber] = useState(20)
  const [showSendModal, setShowSendModal] = useState(false)
  const [showReceiveModal, setShowReceiveModal] = useState(false)

  const [sortBy, setSortBy] = useState<SortBy>({
    property: 'time',
    direction: 'desc',
  })

  const sortByMenu = (
    <Menu>
      {columns
        .filter((column): column is SortableColumnConfig => column.sortable)
        .map(({property, label}) => {
          return (
            <Menu.Item key={property} onClick={() => setSortBy(updateSorting(sortBy, property))}>
              {sortBy.property === property &&
                (sortBy.direction === 'asc' ? <CaretUpFilled /> : <CaretDownFilled />)}
              <Trans k={label} />
            </Menu.Item>
          )
        })}
    </Menu>
  )

  return (
    <div className="TransactionHistory">
      <div className="toolbar">
        <div className="main-title">
          <Trans k={['wallet', 'title', 'transactionHistory']} />
        </div>
        <div className="line"></div>
        <div>
          <Dropdown overlay={sortByMenu} overlayClassName="SortByDropdown">
            <span className="sort-by">
              <Trans k={['wallet', 'button', 'sortByDropdown']} /> ▼{' '}
            </span>
          </Dropdown>
          <Button
            data-testid="send-button"
            type="primary"
            className="action"
            disabled={availableBalance.isZero()}
            onClick={(): void => setShowSendModal(true)}
          >
            <Trans k={['wallet', 'button', 'sendTransaction']} />
          </Button>
          <Button
            data-testid="receive-button"
            type="primary"
            className="action"
            onClick={(): void => setShowReceiveModal(true)}
          >
            <Trans k={['wallet', 'button', 'receiveTransaction']} />
          </Button>
          <SendTransactionFlow
            visible={showSendModal}
            availableAmount={availableBalance}
            onCancel={(): void => setShowSendModal(false)}
            estimateTransactionFee={estimateTransactionFee}
          />
          <ReceiveTransaction
            visible={showReceiveModal}
            onCancel={(): void => setShowReceiveModal(false)}
            onGenerateNew={generateAddress}
            accounts={accounts}
          />
        </div>
      </div>
      {transactions.length === 0 ? (
        <div className="no-transactions">
          <Trans k={['wallet', 'message', 'noTransactions']} />
        </div>
      ) : (
        <div className="transactions-container">
          <InfiniteScroll
            initialLoad={false}
            loadMore={() => setShownTxNumber(shownTxNumber + 10)}
            hasMore={transactions.length > shownTxNumber}
            useWindow={false}
            getScrollParent={() => document.getElementById('main')}
          >
            <TransactionList
              transactions={transactions}
              shownTxNumber={shownTxNumber}
              onSortChange={(sortBy) => setSortBy(sortBy)}
              sortBy={sortBy}
            />
          </InfiniteScroll>
        </div>
      )}
    </div>
  )
}
