import _ from 'lodash/fp'
import {readonlyArray} from 'fp-ts'
import {TransactionHistory} from './TransactionHistory'
import {BatchRange} from './BatchRange'
import {mkAddress, mkBatch, mkHistory, mkTransaction} from './test/historyTestUtils'
import {asEther} from '../../common/units'
import {Transaction} from './Transaction'

const testAddress = mkAddress('foo')
const testTransactions: Transaction[] = [
  mkTransaction({
    direction: 'incoming',
    status: 'confirmed',
    value: asEther(100),
    fee: asEther(1),
    to: testAddress,
  }),
  mkTransaction({
    direction: 'incoming',
    status: 'persisted_depth',
    value: asEther(100),
    fee: asEther(1),
    to: testAddress,
  }),
  mkTransaction({
    direction: 'outgoing',
    status: 'confirmed',
    value: asEther(100),
    fee: asEther(1),
    from: testAddress,
  }),
  mkTransaction({
    direction: 'outgoing',
    status: 'persisted_checkpoint',
    value: asEther(100),
    fee: asEther(1),
    from: testAddress,
  }),
]
const pendingTransaction = mkTransaction({
  direction: 'outgoing',
  status: 'pending',
  value: asEther(100),
  fee: asEther(10),
})

describe('TransactionHistory', () => {
  describe('merging fetched batches in', () => {
    it('does advance last checked block if fetched range follows it', () => {
      const history: TransactionHistory = mkHistory()

      const result = TransactionHistory.mergeBatch(
        history,
        mkBatch(history, {blockRange: BatchRange.ofSize(43, 5)}),
      )

      expect(result.lastCheckedBlock).toEqual(47)
    })

    it('does advance last checked block if it belongs to fetched range', () => {
      const history: TransactionHistory = mkHistory()

      const batchSize = 5
      _.range(history.lastCheckedBlock - batchSize + 1, history.lastCheckedBlock + 1).forEach(
        (startingNumber) => {
          const range = BatchRange.ofSize(startingNumber, batchSize)
          const result = TransactionHistory.mergeBatch(
            history,
            mkBatch(history, {blockRange: range}),
          )

          expect(result.lastCheckedBlock).toEqual(range.max)
        },
      )
    })

    it('does not advance last checked block if range is too new', () => {
      const history: TransactionHistory = mkHistory()

      const result = TransactionHistory.mergeBatch(history, {
        blockRange: BatchRange.ofSize(44, 5),
        transactions: [],
      })

      expect(result.lastCheckedBlock).toEqual(42)
    })

    it('marks disappearing pending transactions as failed', () => {
      const history = mkHistory({transactions: [...testTransactions, pendingTransaction]})
      const batch = mkBatch(history, {transactions: testTransactions})
      const result = TransactionHistory.mergeBatch(history, batch)

      expect(result.transactions).toEqual(
        readonlyArray.sort(Transaction)([
          {...pendingTransaction, status: 'failed'},
          ...testTransactions,
        ]),
      )
    })

    it('keeps failed transactions', () => {
      const failed: Transaction = {...pendingTransaction, status: 'failed'}
      const history = mkHistory({transactions: [...testTransactions, failed]})
      const batch = mkBatch(history, {transactions: testTransactions})

      const result = TransactionHistory.mergeBatch(history, batch)

      expect(result.transactions).toEqual(
        readonlyArray.sort(Transaction)([failed, ...testTransactions]),
      )
    })

    it('keeps confirmed and persisted transactions which are not present in batch', () => {
      const history = mkHistory({
        transactions: readonlyArray.sort(Transaction)(testTransactions),
      })
      const batch = mkBatch(history)

      const result = TransactionHistory.mergeBatch(history, batch)

      expect(result.transactions).toEqual(history.transactions)
    })

    it('prefers new transactions if status changes', () => {
      const confirmed: Transaction = {...pendingTransaction, status: 'confirmed'}
      const history = mkHistory({transactions: [...testTransactions, pendingTransaction]})
      const batch = mkBatch(history, {
        transactions: [confirmed, testTransactions[0], testTransactions[2]],
      })

      const result = TransactionHistory.mergeBatch(history, batch)

      expect(result.transactions).toEqual(
        readonlyArray.sort(Transaction)([confirmed, ...testTransactions]),
      )
    })
  })
})
