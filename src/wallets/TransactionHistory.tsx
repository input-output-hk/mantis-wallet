import React, {useState} from 'react'
import _ from 'lodash/fp'
import {CaretUpFilled, CaretDownFilled} from '@ant-design/icons'
import {Button, Dropdown, Menu} from 'antd'
import BigNumber from 'bignumber.js'
import InfiniteScroll from 'react-infinite-scroller'
import {Transaction, TransparentAddress, Account} from '../web3'
import {SendTransaction} from './modals/SendTransaction'
import {ReceiveTransaction} from './modals/ReceiveTransaction'
import {FeeEstimates} from '../common/wallet-state'
import {TransactionList, updateSorting, SORTABLE_PROPERTIES, SortBy} from './TransactionList'
import './TransactionHistory.scss'

interface TransactionHistoryProps {
  transactions: Transaction[]
  transparentAddresses: TransparentAddress[]
  accounts: Account[]
  availableBalance: BigNumber
  sendTransaction: (recipient: string, amount: number, fee: number) => Promise<void>
  estimateTransactionFee: (amount: BigNumber) => Promise<FeeEstimates>
  sendTxToTransparent: (recipient: string, amount: BigNumber, gasPrice: BigNumber) => Promise<void>
  estimateGasPrice: () => Promise<FeeEstimates>
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
  estimateGasPrice,
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
      {SORTABLE_PROPERTIES.map((name) => {
        return (
          <Menu.Item key={name} onClick={() => setSortBy(updateSorting(sortBy, name))}>
            {sortBy.property === name &&
              (sortBy.direction === 'asc' ? <CaretUpFilled /> : <CaretDownFilled />)}
            {_.capitalize(name)}
          </Menu.Item>
        )
      })}
    </Menu>
  )

  return (
    <div className="TransactionHistory">
      <div className="toolbar">
        <div className="main-title">Transaction History</div>
        <div className="line"></div>
        <div>
          <Dropdown overlay={sortByMenu} overlayClassName="SortByDropdown">
            <span className="sort-by">Sort by ▼ </span>
          </Dropdown>
          <Button
            data-testid="send-button"
            type="primary"
            className="action"
            disabled={availableBalance.isZero()}
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
            availableAmount={availableBalance}
            onCancel={(): void => setShowSendModal(false)}
            onSend={async (recipient: string, amount: number, fee: number): Promise<void> => {
              await sendTransaction(recipient, amount, fee)
              setShowSendModal(false)
            }}
            estimateTransactionFee={estimateTransactionFee}
            onSendToTransparent={async (
              recipient: string,
              amount: BigNumber,
              gasPrice: BigNumber,
            ): Promise<void> => {
              await sendTxToTransparent(recipient, amount, gasPrice)
              setShowSendModal(false)
            }}
            estimateGasPrice={estimateGasPrice}
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
          You haven&apos;t made a transaction
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
