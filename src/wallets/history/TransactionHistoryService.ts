import * as rx from 'rxjs'
import {BehaviorSubject, Observable, Subject} from 'rxjs'
import * as rxop from 'rxjs/operators'
import {BlockHeader} from 'web3-eth'
import {pipe} from 'fp-ts/lib/pipeable'
import {readonlyArray} from 'fp-ts'
import {create, ElectronLog} from 'electron-log'
import * as StoredHistory from './StoredHistory'
import * as TransactionHistory from './TransactionHistory'
import {FetchedBatch} from './TransactionHistory'
import {prop, tap, through, uncurry} from '../../shared/utils'
import {HistoryStore} from './HistoryStore'
import {MantisWeb3} from '../../web3'
import {Store} from '../../common/store'
import {StoreWalletData} from '../../common/wallet-state'
import {BatchRange} from './BatchRange'
import {ArrayOps, RxOps} from '../../shared'

export type Address = string

export type GetAccountTransactions = (
  account: Address,
  fromBlock: number,
  toBlock: number,
) => Promise<readonly TransactionHistory.Transaction[]>

export class TransactionHistoryService {
  constructor(
    public readonly explicitChecks: Subject<void>,
    private readonly blocksBatchSize: number,
    private readonly smallBlocksBatchSize: number,
    private readonly fetchTransactions: GetAccountTransactions,
    private readonly store: HistoryStore,
    private readonly bestBlock$: Observable<BlockHeader>,
    private readonly logger: ElectronLog,
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

  static fetchTransactionsWithWeb3 = (
    web3: MantisWeb3,
    bestBlock$: Observable<BlockHeader>,
  ): GetAccountTransactions => (account, fromBlock, toBlock) =>
    web3.mantis.getAccountTransactions(account, fromBlock, toBlock).then(async (transactions) => {
      const currentBlock = await bestBlock$.pipe(rxop.take(1)).toPromise()
      console.log('Making request for transactions', {currentBlock})
      return pipe(
        transactions,
        TransactionHistory.deduplicatePending,
        readonlyArray.map((tx) =>
          TransactionHistory.transactionFromResponse(tx, currentBlock.number, (txHash) =>
            web3.eth.getTransactionReceipt(txHash),
          ),
        ),
        (arr) => Promise.all(arr),
      )
    })

  static getBestBlockWithWeb3 = (web3: MantisWeb3): Observable<BlockHeader> =>
    rx.interval(1000).pipe(
      rxop.concatMap(() => web3.eth.getBlock('latest')),
      rxop.distinctUntilChanged((a, b) => a.hash == b.hash),
      rxop.tap((block) =>
        console.log('Passed further block', {hash: block.hash, nr: block.number}),
      ),
      rxop.shareReplay(1),
    )

  static create(
    web3: MantisWeb3,
    store: Store<StoreWalletData>,
    logger: ElectronLog,
    bestBlockParam$?: Observable<BlockHeader>,
  ): TransactionHistoryService {
    const bestBlock$ = bestBlockParam$ ?? TransactionHistoryService.getBestBlockWithWeb3(web3)
    const getTransactions = TransactionHistoryService.fetchTransactionsWithWeb3(web3, bestBlock$)
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

  watchAccount = (account: Address): Observable<readonly TransactionHistory.Transaction[]> => {
    return rx.from(this.init(account)).pipe(
      rxop.concatMap(
        (initialHistory): Observable<TransactionHistory.TransactionHistory> => {
          console.log({initialHistory})
          // Usage of Subject allows us to recurse over fetched tx history
          const historySubject = new rx.BehaviorSubject(initialHistory)

          return rx
            .merge(
              this.watchForNewTransactions(account),
              this.scanBlockchain(account, historySubject),
            )
            .pipe(
              rxop.scan(TransactionHistory.mergeBatch, initialHistory),
              rxop.tap((val) => historySubject.next(val)),
              rxop.startWith(initialHistory),
            )
        },
      ),
      RxOps.tapEval(
        through(
          StoredHistory.fromHistory,
          tap((history) => console.log('Saving history', history)),
          this.store.storeHistory,
        ),
      ),
      rxop.pluck('transactions'),
      rxop.catchError((error, _) => {
        this.logger.error(error)
        return this.watchAccount(account)
      }),
    )
  }

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
        rxop.reduce<readonly TransactionHistory.Transaction[]>(uncurry(ArrayOps.concat), []),
      )
      .toPromise()

    return {
      lastCheckedBlock: storedHistory.lastCheckedBlock,
      transactions,
    }
  }

  private scanBlockchain(
    account: Address,
    history$: Observable<TransactionHistory.TransactionHistory>,
  ): Observable<TransactionHistory.FetchedBatch> {
    return rx
      .combineLatest([
        history$.pipe(rxop.tap((h) => console.log('[scanBlockchain][history]', h))),
        this.bestBlock$.pipe(rxop.tap((b) => console.log('[scanBlockchain][bestBlock]', b))),
      ])
      .pipe(
        rxop.map(
          ([lastHistory, bestBlock]) =>
            [this.getScanRange(lastHistory.lastCheckedBlock), bestBlock] as [
              BatchRange,
              BlockHeader,
            ],
        ),
        rxop.filter(([range, bestBlock]) => {
          const topRange = this.getNewRange(bestBlock.number)

          return range.max <= topRange.max
        }),
        rxop.map(([range, _]) => range),
        rxop.distinctUntilChanged(BatchRange.isEqual),
        rxop.concatMap((range) => this.fetchBatch(account, range)),
        // rxop.map(([lastHistory, bestBlock]) => {
        //   console.log(
        //     account,
        //     'Making next call for transactions',
        //     {historyNr: lastHistory.lastCheckedBlock, blockNr: bestBlock.number},
        //     {lastHistory, bestBlock},
        //   )
        //   const nextIterationBatch = BatchRange.ofSize(
        //     lastHistory.lastCheckedBlock,
        //     this.blocksBatchSize,
        //   )
        //   const bestBlockBatch = BatchRange.ofSizeFromMax(bestBlock.number, this.smallBlocksBatchSize)
        //
        //   return BatchRange.miniMini(nextIterationBatch, bestBlockBatch)
        // }),
        // rxop.distinctUntilChanged(BatchRange.isEqual),
        // rxop.concatMap((batchToPick) => this.fetchBatch(account, batchToPick)),
        // rxop.scan(TransactionHistory.mergeBatch, TransactionHistory.empty),
        // rxop.tap((newHistory) => console.log(account, 'Got new history', newHistory)),
        // rxop.tap((newHistory) => historySubject.next(newHistory)),
      )
  }

  private watchForNewTransactions(account: Address): Observable<TransactionHistory.FetchedBatch> {
    return rx
      .combineLatest([
        this.bestBlock$,
        this.explicitChecks.pipe(rxop.startWith<void, void>(void 0)),
      ])
      .pipe(
        rxop.map(([bestBlock, _]) => this.getNewRange(bestBlock.number)),
        rxop.concatMap((range) => this.fetchBatch(account, range)),
      )
  }

  private getNewRange(bestBlockNumber: number): BatchRange {
    return BatchRange.ofSizeFromMax(bestBlockNumber, this.smallBlocksBatchSize, 'new')
  }

  private getScanRange(lastCheckedBlockNumber: number): BatchRange {
    return BatchRange.ofSize(lastCheckedBlockNumber + 1, this.blocksBatchSize, 'scan')
  }

  private fetchBatch(
    account: Address,
    range: BatchRange,
  ): Observable<TransactionHistory.FetchedBatch> {
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
