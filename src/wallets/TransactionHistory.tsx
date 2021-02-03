import React, {useState} from 'react'
import {Button} from 'antd'
import InfiniteScroll from 'react-infinite-scroller'
import {fold, getOrElse, Option} from 'fp-ts/lib/Option'
import {pipe} from 'fp-ts/lib/function'
import {SendTransactionFlow} from './modals/SendTransaction'
import {ReceiveTransaction} from './modals/ReceiveTransaction'
import {SortBy, TransactionList} from './TransactionList'
import {Trans} from '../common/Trans'
import {asWei, Wei} from '../common/units'
import {Account, FeeEstimates} from '../common/wallet-state'
import {Transaction} from './history'

import './TransactionHistory.scss'

export interface TransactionHistoryProps {
  transactions: readonly Transaction[]
  accounts: Account[]
  availableBalance: Option<Wei>
  estimateTransactionFee: () => Promise<FeeEstimates>
  getNextNonce: () => Promise<number>
  generateAddress: () => Promise<void>
}

export const TransactionHistory = ({
  transactions,
  availableBalance,
  estimateTransactionFee,
  getNextNonce,
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

  const isSendDisabled = pipe(
    availableBalance,
    fold(
      () => true,
      (balance) => balance.isZero(),
    ),
  )

  return (
    <div className="TransactionHistory">
      <div className="main-buttons">
        <Button
          data-testid="send-button"
          type="primary"
          className="action left-diagonal"
          disabled={isSendDisabled}
          onClick={(): void => setShowSendModal(true)}
        >
          <Trans k={['wallet', 'button', 'sendTransaction']} />
        </Button>
        <Button
          data-testid="receive-button"
          type="default"
          className="action right-diagonal"
          onClick={(): void => setShowReceiveModal(true)}
        >
          <Trans k={['wallet', 'button', 'receiveTransaction']} />
        </Button>
      </div>
      <div className="toolbar">
        <div className="main-title">
          <Trans k={['wallet', 'title', 'myTransactions']} />
        </div>
        <div>
          <SendTransactionFlow
            visible={showSendModal}
            availableAmount={pipe(
              availableBalance,
              getOrElse(() => asWei(0)),
            )}
            onCancel={(): void => setShowSendModal(false)}
            estimateTransactionFee={estimateTransactionFee}
            getNextNonce={getNextNonce}
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
