import * as rx from 'rxjs'
import {Observable} from 'rxjs'
import * as rxop from 'rxjs/operators'
import {assert} from 'chai'
import {readonlyArray} from 'fp-ts'
import {BlockHeader} from 'web3-eth'
import {pipe} from 'fp-ts/lib/pipeable'
import {GetAccountTransactions, TransactionHistoryService} from './TransactionHistoryService'
import {rendererLog} from '../../common/logger'
import {BatchRange} from './BatchRange'
import {mkAddress, mkBlockHeader, mkTransaction} from './test/historyTestUtils'
import {HistoryStoreFactory, inMemoryHistoryStoreFactory} from './HistoryStore'
import {NetworkName} from '../../config/type'

const PromiseOps = {
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  never: new Promise<never>(() => {}),
}

interface Fixture {
  testAddress: string
  explicitChecks: rx.Subject<void>
  blocksBatchSize: number
  smallBlocksBatchSize: number
  historyStoreFactory: HistoryStoreFactory
  networkName: NetworkName
  fetchTransactions: GetAccountTransactions
  bestBlock$: Observable<BlockHeader>
  txHistoryService: TransactionHistoryService
}
const Fixture = {
  defaults: (): Omit<Fixture, 'txHistoryService'> => {
    return {
      testAddress: mkAddress('foo'),
      explicitChecks: new rx.Subject<void>(),
      blocksBatchSize: 10,
      smallBlocksBatchSize: 2,
      historyStoreFactory: inMemoryHistoryStoreFactory(),
      networkName: 'foo',
      fetchTransactions: () => PromiseOps.never,
      bestBlock$: rx.NEVER,
    }
  },
  build: <F extends Omit<Fixture, 'txHistoryService'>>(
    params: F,
  ): F & {txHistoryService: TransactionHistoryService} => {
    return {
      ...params,
      txHistoryService: new TransactionHistoryService(
        params.explicitChecks,
        params.blocksBatchSize,
        params.smallBlocksBatchSize,
        params.fetchTransactions,
        params.historyStoreFactory,
        params.bestBlock$,
        rendererLog,
      ),
    }
  },
  make: () => pipe(Fixture.defaults(), Fixture.build),
  adjusted: <F extends Partial<Fixture>>(
    adjust: (f: Omit<Fixture, 'txHistoryService'>) => F,
  ): F & Fixture =>
    pipe(Fixture.defaults(), (defaults) => ({...defaults, ...adjust(defaults)}), Fixture.build),
}

describe('TransactionHistoryService', () => {
  it('loads empty state if store is empty', async () => {
    const f = Fixture.make()

    const result = await f.txHistoryService
      .watchAccount(f.networkName, f.testAddress)
      .pipe(rxop.take(1))
      .toPromise()

    assert.deepEqual(result, [])
  })

  it('loads and fetches state from store', async () => {
    const f = Fixture.adjusted(({testAddress, networkName}) => {
      const testTx = mkTransaction({
        direction: 'outgoing',
        from: testAddress,
        status: 'persisted_depth',
      })

      return {
        testTx,
        historyStoreFactory: inMemoryHistoryStoreFactory({
          [networkName]: {
            lastCheckedBlock: 50,
            blocksWithKnownTransactions: [42],
          },
        }),
        fetchTransactions: (account, fromBlock, toBlock) => {
          const range: BatchRange = {min: fromBlock, max: toBlock}
          return BatchRange.contains(42, range) && account == testAddress
            ? Promise.resolve([testTx])
            : Promise.resolve([])
        },
      }
    })

    const result = await f.txHistoryService
      .watchAccount(f.networkName, f.testAddress)
      .pipe(rxop.take(1))
      .toPromise()

    assert.deepEqual(result, [f.testTx])
  })

  it('updates history from scanning whole chain', async () => {
    const f = Fixture.adjusted(({testAddress}) => {
      const testTx = mkTransaction({
        direction: 'outgoing',
        from: testAddress,
        status: 'persisted_depth',
        blockNumber: 42,
      })
      return {
        testTx,
        bestBlock$: rx.of(mkBlockHeader({number: 1000})),
        fetchTransactions: (account, fromBlock, toBlock) => {
          const range: BatchRange = {min: fromBlock, max: toBlock}
          return BatchRange.contains(42, range) && account == testAddress
            ? Promise.resolve([testTx])
            : Promise.resolve([])
        },
      }
    })

    await f.txHistoryService
      .watchAccount(f.networkName, f.testAddress)
      .pipe(rxop.take(7))
      .toPromise()

    const result = await f.historyStoreFactory.getStore(f.networkName).getStoredHistory()

    assert.deepEqual(result, {lastCheckedBlock: 50, blocksWithKnownTransactions: [42]})
  })

  it('updates history from top blocks', async () => {
    const f = Fixture.adjusted(({testAddress}) => {
      const testTx = mkTransaction({
        direction: 'outgoing',
        from: testAddress,
        status: 'persisted_depth',
        blockNumber: 1000,
      })
      return {
        testTx,
        bestBlock$: rx.of(mkBlockHeader({number: 1000})),
        fetchTransactions: (account, fromBlock, toBlock) => {
          const range: BatchRange = {min: fromBlock, max: toBlock}
          return BatchRange.contains(1000, range) && account == testAddress
            ? Promise.resolve([testTx])
            : PromiseOps.never
        },
      }
    })

    const resultTxns = await f.txHistoryService
      .watchAccount(f.networkName, f.testAddress)
      .pipe(rxop.take(2))
      .toPromise()
    const storedHistory = await f.historyStoreFactory.getStore(f.networkName).getStoredHistory()

    assert.deepEqual(resultTxns, [f.testTx])
    assert.deepEqual(storedHistory, {lastCheckedBlock: 0, blocksWithKnownTransactions: [1000]})
  })

  it('updates history on explicit request', async () => {
    const f = Fixture.adjusted(({testAddress}) => {
      const testTx = mkTransaction({
        direction: 'outgoing',
        from: testAddress,
        status: 'persisted_depth',
        blockNumber: 1000,
      })
      const allowFetch = new rx.BehaviorSubject<boolean>(false)

      return {
        testTx,
        allowFetch,
        bestBlock$: rx.of(mkBlockHeader({number: 1000})),
        fetchTransactions: (account, fromBlock, toBlock) => {
          const range: BatchRange = {min: fromBlock, max: toBlock}
          if (BatchRange.contains(1000, range) && account == testAddress) {
            return allowFetch
              .pipe(rxop.take(1))
              .toPromise()
              .then((ifAllow) => (ifAllow ? [testTx] : []))
          } else {
            return PromiseOps.never
          }
        },
      }
    })

    f.explicitChecks.subscribe(() => f.allowFetch.next(true))

    const resultTxnsPromise = f.txHistoryService
      .watchAccount(f.networkName, f.testAddress)
      .pipe(rxop.find(readonlyArray.isNonEmpty))
      .toPromise()

    f.explicitChecks.next(void 0)

    const resultTxns = await resultTxnsPromise
    const storedHistory = await f.historyStoreFactory.getStore(f.networkName).getStoredHistory()

    assert.deepEqual(resultTxns, [f.testTx])
    assert.deepEqual(storedHistory, {lastCheckedBlock: 0, blocksWithKnownTransactions: [1000]})
  })
})
