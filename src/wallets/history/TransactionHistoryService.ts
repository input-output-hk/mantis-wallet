import * as rx from 'rxjs'
import {BehaviorSubject, Observable, Subject} from 'rxjs'
import * as rxop from 'rxjs/operators'
import {BlockHeader, TransactionReceipt} from 'web3-eth'
import {pipe} from 'fp-ts/lib/pipeable'
import {readonlyArray} from 'fp-ts'
import {tap} from 'rxjs/operators'
import {ElectronLog, create} from 'electron-log'
import * as StoredHistory from './StoredHistory'
import * as TransactionHistory from './TransactionHistory'
import {through, prop} from '../../shared/utils'
import {HistoryStore} from './HistoryStore'
import {MantisWeb3} from '../../web3'
import {Store} from '../../common/store'
import {StoreWalletData} from '../../common/wallet-state'
import * as ArrayOps from '../../shared/ArrayOps'

export type Address = string

type BatchRangeType = 'scan' | 'new'
interface BatchRange {
  min: number
  max: number
  //Type 'scan' is for indexing bast blocks while 'new' is for checking transactions near top independently from scanning
  type: BatchRangeType
}
const BatchRange = {
  ofSize: (min: number, size: number, type: BatchRangeType): BatchRange => ({
    min,
    max: min + size - 1,
    type,
  }),
  ofSizeFromMax: (max: number, size: number, type: BatchRangeType): BatchRange => ({
    min: max - size + 1,
    max,
    type,
  }),
  lower: (a: BatchRange, b: BatchRange): BatchRange => (a.min <= b.min ? a : b),
  isEqual: (a: BatchRange, b: BatchRange): boolean => a.min == b.min && a.max == b.max,
  miniMini: (a: BatchRange, b: BatchRange): BatchRange => ({
    min: Math.min(a.min, b.min),
    max: Math.min(a.max, b.max),
    type: a.type
  }),
}

interface FetchedBatch {
  blockRange: BatchRange
  transactions: readonly TransactionHistory.Transaction[]
}

const tapEval = <A>(evalCb: (a: A) => Promise<void>): rx.OperatorFunction<A, A> =>
  rxop.concatMap((a: A) => evalCb(a).then(() => a))

export type GetAccountTransactions = (
  account: Address,
  fromBlock: number,
  toBlock: number,
) => Promise<readonly TransactionHistory.Transaction[]>

export class TransactionHistoryService {
  constructor(
    public explicitChecks: Subject<void>,
    private blocksBatchSize: number,
    private smallBlocksBatchSize: number,
    private fetchTransactions: GetAccountTransactions,
    private store: HistoryStore,
    private bestBlock$: Observable<BlockHeader>,
    private logger: ElectronLog,
  ) {}

  static fake: TransactionHistoryService = new TransactionHistoryService(
    new Subject(),
    1,
    1,
    () => Promise.resolve([]),
    {
      getStoredHistory: () => Promise.resolve(StoredHistory.empty),
      storeHistory: () => Promise.resolve(),
    },
    rx.NEVER,
    create('fake'),
  )

  static create(
    web3: MantisWeb3,
    store: Store<StoreWalletData>,
    logger: ElectronLog,
  ): TransactionHistoryService {
    const bestBlock$ = rx.interval(1000).pipe(
      rxop.concatMap(() => web3.eth.getBlock('latest')),
      rxop.distinctUntilChanged((a, b) => a.hash == b.hash),
      rxop.tap((block) =>
        console.log('Passed further block', {hash: block.hash, nr: block.number}),
      ),
      rxop.shareReplay(1),
    )
    const getReceipt = (txHash: string): Promise<TransactionReceipt> =>
      web3.eth.getTransactionReceipt(txHash)
    const getTransactions: GetAccountTransactions = (
      account: Address,
      fromBlock: number,
      toBlock: number,
    ) =>
      web3.mantis.getAccountTransactions(account, fromBlock, toBlock).then(async (transactions) => {
        const currentBlock = await bestBlock$.pipe(rxop.take(1)).toPromise()
        console.log('Making request for transactions', {currentBlock})
        return pipe(
          transactions,
          TransactionHistory.deduplicatePending,
          readonlyArray.map((tx) =>
            TransactionHistory.transactionFromResponse(tx, currentBlock.number, getReceipt),
          ),
          (arr) => Promise.all(arr),
        )
      })
    const txStore = HistoryStore(store)

    return new TransactionHistoryService(
      new BehaviorSubject<void>(void 0),
      500,
      100,
      getTransactions,
      txStore,
      bestBlock$,
      logger,
    )
  }

  clean = () => {
    return this.store.storeHistory(StoredHistory.empty)
  }

  watchAccount = (account: Address): Observable<readonly TransactionHistory.Transaction[]> =>
    rx.from(this.init(account)).pipe(
      rxop.concatMap((initialHistory) =>
        rx.concat(rx.of(initialHistory), this.fetchMissingTransactions(account, initialHistory)),
      ),
      tapEval(through(StoredHistory.fromHistory, this.store.storeHistory)),
      rxop.pluck('transactions'),
      rxop.catchError((error, _) => {
        this.logger.error(error)
        return this.watchAccount(account)
      }),
    )

  private async init(account: Address): Promise<TransactionHistory.TransactionHistory> {
    const storedHistory = await this.store.getStoredHistory()
    console.log(account, 'Stored history', storedHistory)
    const transactions: readonly TransactionHistory.Transaction[] = await rx
      .from(storedHistory.blocksWithKnownTransactions)
      .pipe(
        rxop.mergeMap(async (blockToCheck) => {
          console.log('making a call for known tx', {
            account,
            from: blockToCheck,
            to: blockToCheck + 1,
          })
          return this.fetchTransactions(account, blockToCheck, blockToCheck + 1)
        }, 5),
        rxop.reduce<readonly TransactionHistory.Transaction[]>(ArrayOps.concat, []),
      )
      .toPromise()

    return {
      lastCheckedBlock: storedHistory.lastCheckedBlock,
      transactions,
    }
  }

  private fetchMissingTransactions(
    account: Address,
    initialHistory: TransactionHistory.TransactionHistory,
  ): Observable<TransactionHistory.TransactionHistory> {
    //Usage of BehaviorSubject gives us 2 things here:
    // 1. It allows to recurse over fetched tx history
    // 2. It always stores last value, so new subscriptions won't trigger many fetches
    const historySubject = new rx.Subject<TransactionHistory.TransactionHistory>()

    return rx
      .combineLatest([
        rx.concat(rx.of(initialHistory), historySubject),
        this.bestBlock$,
        this.explicitChecks.pipe(
          rxop.map(() => Date.now()),
          rxop.distinctUntilChanged(),
        ),
      ])
      .pipe(
        rxop.distinctUntilChanged(
          (
            [previousHistory, previousBlock, previousCheckTime],
            [currentHistory, currentBlock, currentCheckTime],
          ) => {
            return (
              previousHistory.lastCheckedBlock == currentHistory.lastCheckedBlock &&
              previousBlock.hash == currentBlock.hash &&
              previousCheckTime == currentCheckTime
            )
          },
        ),
        rxop.map(([lastHistory, bestBlock]) => {
          console.log(
            account,
            'Making next call for transactions',
            {historyNr: lastHistory.lastCheckedBlock, blockNr: bestBlock.number},
            {lastHistory, bestBlock},
          )
          const nextIterationBatch = BatchRange.ofSize(
            lastHistory.lastCheckedBlock,
            this.blocksBatchSize,
          )
          const bestBlockBatch = BatchRange.ofSizeFromMax(
            bestBlock.number,
            this.smallBlocksBatchSize,
          )

          return BatchRange.miniMini(nextIterationBatch, bestBlockBatch)
        }),
        rxop.distinctUntilChanged(BatchRange.isEqual),
        rxop.concatMap((batchToPick) => this.fetchBatch(account, batchToPick)),
        rxop.scan(
          (prev, last) => TransactionHistory.mergeBatch(prev, last),
          TransactionHistory.empty,
        ),
        tap((newHistory) => console.log(account, 'Got new history', newHistory)),
        tap((newHistory) => historySubject.next(newHistory)),
      )
  }

  private fetchBatch(account: Address, range: BatchRange): Observable<FetchedBatch> {
    return rx
      .defer(() => {
        console.log(account, 'making a request for transactions', range)

        return rx.from(this.fetchTransactions(account, range.min, range.max))
      })
      .pipe(
        rxop.tap((transactions) =>
          console.log(account, 'received transactions', transactions.map(prop('hash'))),
        ),
        rxop.map(
          (transactions): FetchedBatch => ({
            blockRange: range,
            transactions,
          }),
          rxop.retry(),
        ),
      )
  }
}
