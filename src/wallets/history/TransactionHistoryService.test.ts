import * as rx from 'rxjs'
import * as rxop from 'rxjs/operators'
import {assert} from 'chai'
import {readonlyArray} from 'fp-ts'
import {GetAccountTransactions, TransactionHistoryService} from './TransactionHistoryService'
import {InMemoryHistoryStore} from './HistoryStore'
import {rendererLog} from '../../common/logger'
import {BatchRange} from './BatchRange'
import {mkAddress, mkBlockHeader, mkTransaction} from './test/historyTestUtils'

const PromiseOps = {
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  never: new Promise<never>(() => {}),
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockFn = <T extends (...args: any[]) => any>(): jest.Mock<ReturnType<T>, Parameters<T>> => {
  return jest.fn()
}

describe('TransactionHistoryService', () => {
  it('loads empty state if store is empty', async () => {
    const testAddress = mkAddress('foo')
    const explicitChecks = new rx.Subject<void>()
    const blocksBatchSize = 10
    const smallBlocksBatchSize = 2
    const historyStore = InMemoryHistoryStore()
    const fetchTransactions: GetAccountTransactions = () => PromiseOps.never
    const txHistoryService = new TransactionHistoryService(
      explicitChecks,
      blocksBatchSize,
      smallBlocksBatchSize,
      fetchTransactions,
      historyStore,
      rx.NEVER,
      rendererLog,
    )

    const result = await txHistoryService
      .watchAccount(testAddress)
      .pipe(rxop.take(1))
      .toPromise()

    assert.deepEqual(result, [])
  })

  it('loads and fetches state from store', async () => {
    const testAddress = mkAddress('foo')
    const explicitChecks = new rx.Subject<void>()
    const blocksBatchSize = 10
    const smallBlocksBatchSize = 2
    const historyStore = InMemoryHistoryStore({
      lastCheckedBlock: 50,
      blocksWithKnownTransactions: [42],
    })
    const testTx = mkTransaction({
      direction: 'outgoing',
      from: testAddress,
      status: 'persisted_depth',
    })
    const fetchTransactions = mockFn<GetAccountTransactions>().mockImplementation(
      (account, fromBlock, toBlock) => {
        const range: BatchRange = {min: fromBlock, max: toBlock, type: 'scan'}
        return BatchRange.contains(42, range) && account == testAddress
          ? Promise.resolve([testTx])
          : Promise.resolve([])
      },
    )
    const txHistoryService = new TransactionHistoryService(
      explicitChecks,
      blocksBatchSize,
      smallBlocksBatchSize,
      fetchTransactions,
      historyStore,
      rx.NEVER,
      rendererLog,
    )

    const result = await txHistoryService
      .watchAccount(testAddress)
      .pipe(rxop.take(1))
      .toPromise()

    assert.deepEqual(result, [testTx])
  })

  it('updates history from scanning whole chain', async () => {
    const testAddress = mkAddress('foo')
    const explicitChecks = new rx.Subject<void>()
    const blocksBatchSize = 10
    const smallBlocksBatchSize = 2
    const historyStore = InMemoryHistoryStore()
    const testTx = mkTransaction({
      direction: 'outgoing',
      from: testAddress,
      status: 'persisted_depth',
      blockNumber: 42,
    })
    const fetchTransactions = mockFn<GetAccountTransactions>().mockImplementation(
      (account, fromBlock, toBlock) => {
        const range: BatchRange = {min: fromBlock, max: toBlock, type: 'scan'}
        return BatchRange.contains(42, range) && account == testAddress
          ? Promise.resolve([testTx])
          : Promise.resolve([])
      },
    )
    const txHistoryService = new TransactionHistoryService(
      explicitChecks,
      blocksBatchSize,
      smallBlocksBatchSize,
      fetchTransactions,
      historyStore,
      rx.of(mkBlockHeader({number: 1000})),
      rendererLog,
    )

    await txHistoryService
      .watchAccount(testAddress)
      .pipe(rxop.take(7))
      .toPromise()

    const result = await historyStore.getStoredHistory()

    assert.deepEqual(result, {lastCheckedBlock: 50, blocksWithKnownTransactions: [42]})
  })

  it('updates history from top blocks', async () => {
    const testAddress = mkAddress('foo')
    const explicitChecks = new rx.Subject<void>()
    const blocksBatchSize = 10
    const smallBlocksBatchSize = 2
    const historyStore = InMemoryHistoryStore()
    const testTx = mkTransaction({
      direction: 'outgoing',
      from: testAddress,
      status: 'persisted_depth',
      blockNumber: 1000,
    })
    const fetchTransactions = mockFn<GetAccountTransactions>().mockImplementation(
      (account, fromBlock, toBlock) => {
        const range: BatchRange = {min: fromBlock, max: toBlock, type: 'scan'}
        return BatchRange.contains(1000, range) && account == testAddress
          ? Promise.resolve([testTx])
          : PromiseOps.never
      },
    )
    const txHistoryService = new TransactionHistoryService(
      explicitChecks,
      blocksBatchSize,
      smallBlocksBatchSize,
      fetchTransactions,
      historyStore,
      rx.of(mkBlockHeader({number: 1000})),
      rendererLog,
    )

    const resultTxns = await txHistoryService
      .watchAccount(testAddress)
      .pipe(rxop.take(2))
      .toPromise()
    const storedHistory = await historyStore.getStoredHistory()

    assert.deepEqual(resultTxns, [testTx])
    assert.deepEqual(storedHistory, {lastCheckedBlock: 0, blocksWithKnownTransactions: [1000]})
  })

  it('updates history on explicit request', async () => {
    const testAddress = mkAddress('foo')
    const explicitChecks = new rx.Subject<void>()
    const blocksBatchSize = 10
    const smallBlocksBatchSize = 2
    const historyStore = InMemoryHistoryStore()
    const testTx = mkTransaction({
      direction: 'outgoing',
      from: testAddress,
      status: 'persisted_depth',
      blockNumber: 1000,
    })
    const allowFetch = new rx.BehaviorSubject<boolean>(false)
    const fetchTransactions = mockFn<GetAccountTransactions>().mockImplementation(
      (account, fromBlock, toBlock) => {
        const range: BatchRange = {min: fromBlock, max: toBlock, type: 'scan'}
        if (BatchRange.contains(1000, range) && account == testAddress) {
          return allowFetch
            .pipe(rxop.take(1))
            .toPromise()
            .then((ifAllow) => (ifAllow ? [testTx] : []))
        } else {
          return PromiseOps.never
        }
      },
    )
    const txHistoryService = new TransactionHistoryService(
      explicitChecks,
      blocksBatchSize,
      smallBlocksBatchSize,
      fetchTransactions,
      historyStore,
      rx.of(mkBlockHeader({number: 1000})),
      rendererLog,
    )

    explicitChecks.subscribe(() => allowFetch.next(true))

    const resultTxnsPromise = txHistoryService
      .watchAccount(testAddress)
      .pipe(rxop.find(readonlyArray.isNonEmpty))
      .toPromise()

    explicitChecks.next(void 0)

    const resultTxns = await resultTxnsPromise
    const storedHistory = await historyStore.getStoredHistory()

    assert.deepEqual(resultTxns, [testTx])
    assert.deepEqual(storedHistory, {lastCheckedBlock: 0, blocksWithKnownTransactions: [1000]})
  })
})
