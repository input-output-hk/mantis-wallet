import React, {useState} from 'react'
import _ from 'lodash/fp'
import BigNumber from 'bignumber.js'
import * as record from 'fp-ts/lib/Record'
import {sort, map} from 'fp-ts/lib/Array'
import {Ord, ordString, ordNumber, ord, getDualOrd} from 'fp-ts/lib/Ord'
import {pipe} from 'fp-ts/lib/pipeable'
import classnames from 'classnames'
import InfiniteScroll from 'react-infinite-scroller'
import {Button, Dropdown, Menu, Icon} from 'antd'
import {Transaction, TransparentAddress, Account} from '../web3'
import {SendTransaction} from './modals/SendTransaction'
import {ReceiveTransaction} from './modals/ReceiveTransaction'
import {
  TransactionCellProps,
  TxAmountCell,
  TxAssetCell,
  TxTimeCell,
  TxStatusCell,
  TxTypeCell,
  TxDetailsCell,
} from './TransactionRow'
import './TransactionHistory.scss'
import {FeeEstimates} from '../common/wallet-state'

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

type SortableProperty = 'type' | 'amount' | 'time' | 'status'
type Property = SortableProperty | 'asset'
type Direction = 'asc' | 'desc'

interface SortBy {
  property: SortableProperty
  direction: Direction
}

interface ColumnConfig {
  property: Property
  sortable: boolean
  CellComponent: ({transaction}: TransactionCellProps) => JSX.Element
}

const columns: ColumnConfig[] = [
  {
    property: 'type',
    sortable: true,
    CellComponent: TxTypeCell,
  },
  {
    property: 'asset',
    sortable: false,
    CellComponent: TxAssetCell,
  },
  {
    property: 'amount',
    sortable: true,
    CellComponent: TxAmountCell,
  },
  {
    property: 'time',
    sortable: true,
    CellComponent: TxTimeCell,
  },
  {
    property: 'status',
    sortable: true,
    CellComponent: TxStatusCell,
  },
]

const orderConfigs: Record<SortableProperty, Ord<Transaction>> = {
  type: ord.contramap(ordString, ({txDetails}: Transaction) => txDetails.txType),
  amount: ord.contramap(ordNumber, ({txDirection, txValue}: Transaction) => {
    const sign = txDirection === 'incoming' ? 1 : -1
    return sign * parseInt(typeof txValue === 'string' ? txValue : txValue.value)
  }),
  time: ord.contramap(ordNumber, ({txStatus}: Transaction) => {
    if (txStatus === 'pending') {
      return Infinity
    } else if (txStatus === 'failed' || !txStatus.atBlock) {
      return 0
    } else {
      return parseInt(txStatus.atBlock, 16)
    }
  }),
  // FIXME: do not order as string, but semantically: failed - pending - confirmed - persisted
  status: ord.contramap(ordString, ({txStatus}: Transaction) =>
    typeof txStatus === 'string' ? txStatus : txStatus.status,
  ),
}

const updateSorting = (currentSortBy: SortBy, nextProperty: SortableProperty): SortBy => {
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

const getOrd = ({direction, property}: SortBy): Ord<Transaction> => {
  return direction === 'asc' ? orderConfigs[property] : getDualOrd(orderConfigs[property])
}

export const transactionTableStyle = {
  gridTemplateColumns: `repeat(${columns.length}, auto)`,
}

export const TransactionRow = ({transaction}: {transaction: Transaction}): JSX.Element => {
  const [detailsShown, setDetailsShown] = useState<boolean>(false)

  return (
    <div className={classnames('TransactionRow', {open: detailsShown})}>
      <div className="row-header" onClick={() => setDetailsShown(!detailsShown)}>
        {columns.map(({property, CellComponent}) => (
          <div className="cell" key={property}>
            <CellComponent transaction={transaction} />
          </div>
        ))}
      </div>
      <div className={classnames('details', {active: detailsShown})}>
        <div className="content">
          <TxDetailsCell transaction={transaction} />
        </div>
      </div>
    </div>
  )
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

  const changeOrder = (property: SortableProperty) => (): void =>
    setSortBy(updateSorting(sortBy, property))

  const sortByMenu = (
    <Menu>
      {record.keys(orderConfigs).map((name) => {
        return (
          <Menu.Item key={name} onClick={changeOrder(name)}>
            {sortBy.property === name && (
              <Icon type={sortBy.direction === 'asc' ? 'caret-up' : 'caret-down'} />
            )}
            {_.capitalize(name)}
          </Menu.Item>
        )
      })}
    </Menu>
  )

  const Header = ({column: {property, sortable}}: {column: ColumnConfig}): JSX.Element => {
    const label = _.capitalize(property)

    return !sortable ? (
      <div>{label}</div>
    ) : (
      <div onClick={changeOrder(property as SortableProperty)} className="sortable">
        <span className="label">{label}</span>
        {sortBy.property === property && (
          <Icon type={sortBy.direction === 'asc' ? 'caret-up' : 'caret-down'} />
        )}
      </div>
    )
  }

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
          <div className="no-transactions-text">You haven&apos;t made a transaction</div>
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
            <div className="transactions" style={transactionTableStyle}>
              <div className="header">
                {columns.map((column) => (
                  <Header column={column} key={column.property} />
                ))}
              </div>
              <div className="body">
                {pipe(
                  transactions,
                  sort(getOrd(sortBy)),
                  _.take(shownTxNumber),
                  map((tx: Transaction) => <TransactionRow transaction={tx} key={tx.hash} />),
                )}
              </div>
            </div>
          </InfiniteScroll>
        </div>
      )}
    </div>
  )
}
