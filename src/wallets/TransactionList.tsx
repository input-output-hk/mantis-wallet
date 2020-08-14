import React, {useState, useEffect} from 'react'
import _ from 'lodash/fp'
import classnames from 'classnames'
import {CaretUpFilled, CaretDownFilled} from '@ant-design/icons'
import {pipe} from 'fp-ts/lib/pipeable'
import {sort, map} from 'fp-ts/lib/Array'
import {Ord, ordString, ordNumber, ord, getDualOrd} from 'fp-ts/lib/Ord'
import {TxStatusString} from '../web3'
import {fillActionHandlers} from '../common/util'
import {
  ExtendedTransaction,
  TransactionCellProps,
  TxAmountCell,
  TxAssetCell,
  TxTimeCell,
  TxStatusCell,
  TxTypeCell,
  TxDetailsCell,
} from './TransactionRow'
import {TKeyRenderer} from '../common/i18n'
import {Trans} from '../common/Trans'
import './TransactionList.scss'

type SortableProperty = 'type' | 'amount' | 'time' | 'status'
type NonSortableProperty = 'asset'
type Direction = 'asc' | 'desc'

export interface SortBy {
  property: SortableProperty
  direction: Direction
}

interface TransactionListProps {
  transactions: ExtendedTransaction[]
  shownTxNumber?: number
  onSortChange?: (sortBy: SortBy) => void
  initialSortBy?: SortBy
  sortBy?: SortBy
}

export const updateSorting = (currentSortBy: SortBy, nextProperty: SortableProperty): SortBy => {
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

interface CommonColumnConfig {
  label: TKeyRenderer
  CellComponent: ({transaction}: TransactionCellProps) => JSX.Element
}

export interface SortableColumnConfig extends CommonColumnConfig {
  property: SortableProperty
  sortable: true
}

interface NonSortableColumnConfig extends CommonColumnConfig {
  property: NonSortableProperty
  sortable: false
}

type ColumnConfig = SortableColumnConfig | NonSortableColumnConfig

export const columns: ColumnConfig[] = [
  {
    property: 'type',
    label: ['wallet', 'label', 'transactionType'],
    sortable: true,
    CellComponent: TxTypeCell,
  },
  {
    property: 'asset',
    label: ['wallet', 'label', 'asset'],
    sortable: false,
    CellComponent: TxAssetCell,
  },
  {
    property: 'amount',
    label: ['wallet', 'label', 'amount'],
    sortable: true,
    CellComponent: TxAmountCell,
  },
  {
    property: 'time',
    label: ['wallet', 'label', 'transactionTime'],
    sortable: true,
    CellComponent: TxTimeCell,
  },
  {
    property: 'status',
    label: ['wallet', 'label', 'transactionStatus'],
    sortable: true,
    CellComponent: TxStatusCell,
  },
]

const TX_STATUS_ORDER: Record<TxStatusString, number> = {
  failed: 0,
  pending: 1,
  confirmed: 2,
  persisted: 3,
} as const

const orderConfigs: Record<SortableProperty, Ord<ExtendedTransaction>> = {
  type: ord.contramap(ordString, ({txDetails}: ExtendedTransaction) => txDetails.txType),
  amount: ord.contramap(ordNumber, ({txDirection, txValue}: ExtendedTransaction) => {
    const sign = txDirection === 'incoming' ? 1 : -1
    return sign * parseInt(typeof txValue === 'string' ? txValue : txValue.value)
  }),
  time: ord.contramap(ordNumber, ({txStatus}: ExtendedTransaction) => {
    if (txStatus === 'pending') {
      return Infinity
    } else if (txStatus === 'failed' || !txStatus.atBlock) {
      return 0
    } else {
      return txStatus.timestamp
    }
  }),
  status: ord.contramap(
    ordNumber,
    ({txDetails, txStatus}: ExtendedTransaction) =>
      TX_STATUS_ORDER[typeof txStatus === 'string' ? txStatus : txStatus.status] -
      (txDetails.txType === 'call' && txDetails.callTxStatus.status === 'TransactionFailed'
        ? 0.5
        : 0),
  ),
}

const _TransactionRow = ({transaction}: TransactionCellProps): JSX.Element => {
  const [detailsShown, setDetailsShown] = useState<boolean>(false)

  return (
    <div className={classnames('TransactionRow', {open: detailsShown})}>
      <div className="row-header" {...fillActionHandlers(() => setDetailsShown(!detailsShown))}>
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
const TransactionRow = React.memo(_TransactionRow, _.isEqual)

const getOrd = ({direction, property}: SortBy): Ord<ExtendedTransaction> => {
  return direction === 'asc' ? orderConfigs[property] : getDualOrd(orderConfigs[property])
}

export const TransactionList = ({
  transactions,
  shownTxNumber,
  onSortChange,
  initialSortBy = {
    property: 'time',
    direction: 'desc',
  },
  sortBy,
}: TransactionListProps): JSX.Element => {
  const [_sortBy, setSortBy] = useState<SortBy>(sortBy || initialSortBy)

  const changeOrder = (property: SortableProperty) => (): void => {
    const newSortBy = updateSorting(_sortBy, property)
    setSortBy(newSortBy)
    onSortChange?.(newSortBy)
  }

  const Header = ({column: {property, label, sortable}}: {column: ColumnConfig}): JSX.Element => {
    return !sortable ? (
      <div>
        <Trans k={label} />
      </div>
    ) : (
      <div className="sortable" {...fillActionHandlers(changeOrder(property as SortableProperty))}>
        <span className="label">
          <Trans k={label} />
        </span>
        {_sortBy.property === property &&
          (_sortBy.direction === 'asc' ? <CaretUpFilled /> : <CaretDownFilled />)}
      </div>
    )
  }

  useEffect(() => {
    if (sortBy && !_.isEqual(sortBy)(_sortBy)) {
      setSortBy(sortBy)
    }
  }, [sortBy])

  return (
    <div
      className="TransactionList"
      style={{
        gridTemplateColumns: `repeat(${columns.length}, auto)`,
      }}
    >
      <div className="header">
        {columns.map((column) => (
          <Header column={column} key={column.property} />
        ))}
      </div>
      <div className="body">
        {pipe(
          transactions,
          sort(getOrd(_sortBy)),
          _.take(shownTxNumber || transactions.length),
          map((tx: ExtendedTransaction) => <TransactionRow transaction={tx} key={tx.hash} />),
        )}
      </div>
    </div>
  )
}
