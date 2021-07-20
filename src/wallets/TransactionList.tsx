import React, {useEffect, useState} from 'react'
import _ from 'lodash/fp'
import classnames from 'classnames'
import {CaretDownFilled, CaretUpFilled} from '@ant-design/icons'
import {pipe} from 'fp-ts/lib/pipeable'
import {sort, map} from 'fp-ts/lib/ReadonlyArray'
import {getDualOrd, ord, Ord, ordNumber} from 'fp-ts/lib/Ord'
import {fillActionHandlers} from '../common/util'
import {
  TransactionCellProps,
  TxAmountCell,
  TxAssetCell,
  TxDetailsCell,
  TxStatusCell,
  TxTimeCell,
  TxTypeCell,
} from './TransactionRow'
import {TKeyRenderer} from '../common/i18n'
import {Trans} from '../common/Trans'
import {Transaction} from './history'

import './TransactionList.scss'

type SortableProperty = 'amount' | 'time' | 'status'
type NonSortableProperty = 'type' | 'asset'
type Direction = 'asc' | 'desc'

export interface SortBy {
  property: SortableProperty
  direction: Direction
}

interface TransactionListProps {
  transactions: readonly Transaction[]
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
  CellComponent: (props: TransactionCellProps) => JSX.Element
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
    sortable: false,
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

const TX_STATUS_ORDER: Record<Transaction['status'], number> = {
  failed: 0,
  pending: 1,
  confirmed: 2,
  persisted_depth: 3,
  persisted_checkpoint: 4,
} as const

const orderConfigs: Record<SortableProperty, Ord<Transaction>> = {
  amount: ord.contramap(ordNumber, ({value, fee, direction}: Transaction) => {
    return direction === 'outgoing' ? -1 * value.plus(fee).toNumber() : value.toNumber()
  }),
  time: ord.contramap(ordNumber, ({status, blockNumber}: Transaction) => {
    if (status === 'pending') {
      return Infinity
    } else if (status === 'failed' || blockNumber === null) {
      return 0
    } else {
      return blockNumber
    }
  }),
  status: ord.contramap(ordNumber, ({status}: Transaction) => TX_STATUS_ORDER[status]),
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

const getOrd = ({direction, property}: SortBy): Ord<Transaction> => {
  return direction === 'asc' ? orderConfigs[property] : getDualOrd(orderConfigs[property])
}

export const TransactionList = ({
  transactions,
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
          map((tx) => <TransactionRow transaction={tx} key={tx.hash} />),
        )}
      </div>
    </div>
  )
}
