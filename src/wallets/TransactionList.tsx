import React, {useState, useEffect} from 'react'
import _ from 'lodash/fp'
import classnames from 'classnames'
import {CaretUpFilled, CaretDownFilled} from '@ant-design/icons'
import {pipe} from 'fp-ts/lib/pipeable'
import {sort, map} from 'fp-ts/lib/Array'
import {Ord, ordString, ordNumber, ord, getDualOrd} from 'fp-ts/lib/Ord'
import {Transaction} from '../web3'
import {
  TransactionCellProps,
  TxAmountCell,
  TxAssetCell,
  TxTimeCell,
  TxStatusCell,
  TxTypeCell,
  TxDetailsCell,
} from './TransactionRow'
import './TransactionList.scss'

export const SORTABLE_PROPERTIES = ['type', 'amount', 'time', 'status'] as const
type SortableProperty = typeof SORTABLE_PROPERTIES[number]
type Property = SortableProperty | 'asset'
type Direction = 'asc' | 'desc'

export interface SortBy {
  property: SortableProperty
  direction: Direction
}

interface TransactionListProps {
  transactions: Transaction[]
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

const TransactionRow = ({transaction}: {transaction: Transaction}): JSX.Element => {
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

const getOrd = ({direction, property}: SortBy): Ord<Transaction> => {
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

  const Header = ({column: {property, sortable}}: {column: ColumnConfig}): JSX.Element => {
    const label = _.capitalize(property)

    return !sortable ? (
      <div>{label}</div>
    ) : (
      <div onClick={changeOrder(property as SortableProperty)} className="sortable">
        <span className="label">{label}</span>
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
          map((tx: Transaction) => <TransactionRow transaction={tx} key={tx.hash} />),
        )}
      </div>
    </div>
  )
}
