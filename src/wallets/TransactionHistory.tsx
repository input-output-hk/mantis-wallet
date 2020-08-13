import React, {useState} from 'react'
import {CaretUpFilled, CaretDownFilled} from '@ant-design/icons'
import {Button, Dropdown, Menu} from 'antd'
import BigNumber from 'bignumber.js'
import InfiniteScroll from 'react-infinite-scroller'
import {Transaction, TransparentAddress, Account} from '../web3'
import {SendTransaction} from './modals/SendTransaction'
import {ReceiveTransaction} from './modals/ReceiveTransaction'
import {FeeEstimates} from '../common/wallet-state'
import {
  TransactionList,
  updateSorting,
  SortBy,
  columns,
  SortableColumnConfig,
} from './TransactionList'
import {Trans} from '../common/Trans'
import './TransactionHistory.scss'

export interface TransactionHistoryProps {
  transactions: Transaction[]
  transparentAddresses: TransparentAddress[]
  accounts: Account[]
  availableBalance: BigNumber
  sendTransaction: (recipient: string, amount: number, fee: number, memo: string) => Promise<void>
  estimateTransactionFee: (amount: BigNumber) => Promise<FeeEstimates>
  sendTxToTransparent: (recipient: string, amount: BigNumber, fee: BigNumber) => Promise<void>
  estimatePublicTransactionFee: (amount: BigNumber, recipient: string) => Promise<FeeEstimates>
  generateAddress: () => Promise<void>
  goToAccounts: () => void
}

export const TransactionHistory = ({
  transactions,
  accounts,
  availableBalance,
  sendTransaction,
  estimateTransactionFee,
  sendTxToTransparent,
  estimatePublicTransactionFee,
  generateAddress,
  transparentAddresses,
  goToAccounts,
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
          <Button
            type="primary"
            disabled={transparentAddresses.length === 0}
            className="action secondary"
            onClick={goToAccounts}
          >
            <Trans k={['wallet', 'button', 'goToTransparentAccounts']} />
          </Button>
          <SendTransaction
            visible={showSendModal}
            accounts={accounts}
            availableAmount={availableBalance}
            onCancel={(): void => setShowSendModal(false)}
            onSend={async (
              recipient: string,
              amount: number,
              fee: number,
              memo: string,
            ): Promise<void> => {
              await sendTransaction(recipient, amount, fee, memo)
              setShowSendModal(false)
            }}
            estimateTransactionFee={estimateTransactionFee}
            onSendToTransparent={async (
              recipient: string,
              amount: BigNumber,
              fee: BigNumber,
            ): Promise<void> => {
              await sendTxToTransparent(recipient, amount, fee)
              setShowSendModal(false)
            }}
            estimatePublicTransactionFee={estimatePublicTransactionFee}
          />
          <ReceiveTransaction
            visible={showReceiveModal}
            privateAddress={accounts[0].address || ''} // FIXME: PM-1555 - refactor to support multiple wallets
            onCancel={(): void => setShowReceiveModal(false)}
            onGenerateNew={generateAddress}
            transparentAddresses={transparentAddresses}
            goToAccounts={goToAccounts}
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
