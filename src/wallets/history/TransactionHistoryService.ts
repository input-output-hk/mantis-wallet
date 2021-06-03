import * as rx from 'rxjs'
import {BehaviorSubject, Observable, Subject} from 'rxjs'
import * as rxop from 'rxjs/operators'
import {BlockHeader} from 'web3-eth'
import {pipe} from 'fp-ts/lib/pipeable'
import {readonlyArray} from 'fp-ts'
import {create, ElectronLog} from 'electron-log'
import * as StoredHistory from './StoredHistory'
import {FetchedBatch, TransactionHistory} from './TransactionHistory'
import {through, uncurry} from '../../shared/utils'
import {
  HistoryStore,
  historyStoreFactory,
  HistoryStoreFactory,
  GenericWalletStoreWithTxHistory,
} from './HistoryStore'
import {MantisWeb3} from '../../web3'
import {Store} from '../../common/store'
import {BatchRange} from './BatchRange'
import {ArrayOps, RxOps} from '../../shared'
import {NetworkName} from '../../config/type'
import {Transaction} from './Transaction'

export type Address = string

export type GetAccountTransactions = (
  account: Address,
  fromBlock: number,
  toBlock: number,
) => Promise<readonly Transaction[]>
export class TransactionHistoryService {
  constructor(
    public readonly explicitChecks: Subject<void>,
    private readonly blocksBatchSize: number,
    private readonly smallBlocksBatchSize: number,
    private readonly fetchTransactions: GetAccountTransactions,
    private readonly storeFactory: HistoryStoreFactory,
    private readonly bestBlock$: Observable<BlockHeader>,
    private readonly logger: ElectronLog,
  ) {}

  static fake: TransactionHistoryService = new TransactionHistoryService(
    new Subject(),
    1,
    1,
    () => Promise.resolve([]),
    {
      getStore: () => ({
        getStoredHistory: () => Promise.resolve(StoredHistory.empty),
        storeHistory: () => Promise.resolve(),
      }),
      clean: () => Promise.resolve(),
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
    rx.interval(2000).pipe(
      rxop.concatMap(() => web3.eth.getBlock('latest')),
      rxop.distinctUntilChanged((a, b) => a.hash == b.hash),
      rxop.shareReplay(1),
    )

  static create(
    web3: MantisWeb3,
    store: Store<GenericWalletStoreWithTxHistory>,
    logger: ElectronLog,
    bestBlockParam$?: Observable<BlockHeader>,
  ): TransactionHistoryService {
    const bestBlock$ = bestBlockParam$ ?? TransactionHistoryService.getBestBlockWithWeb3(web3)
    const getTransactions = TransactionHistoryService.fetchTransactionsWithWeb3(web3, bestBlock$)
    const storeFactory = historyStoreFactory(store)

    return new TransactionHistoryService(
      new BehaviorSubject<void>(void 0),
      500,
      500,
      getTransactions,
      storeFactory,
      bestBlock$,
      logger,
    )
  }

  clean = (): Promise<void> => this.storeFactory.clean()

  watchAccount = (
    networkName: NetworkName,
    account: Address,
  ): Observable<readonly Transaction[]> => {
    this.logger.info('Started watching', {networkName, account})
    const store = this.storeFactory.getStore(networkName)
    return rx.from(this.init(store, account)).pipe(
      rxop.concatMap(
        (initialHistory): Observable<TransactionHistory> => {
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
      RxOps.tapEval(through(StoredHistory.fromHistory, store.storeHistory)),
      rxop.pluck('transactions'),
      rxop.catchError((error) => {
        // eslint-disable-next-line no-console
        console.error(error)
        this.logger.error(error)
        return this.watchAccount(networkName, account)
      }),
    )
  }

  private async init(store: HistoryStore, account: Address): Promise<TransactionHistory> {
    const storedHistory = await store.getStoredHistory()
    const transactions: readonly Transaction[] = await rx
      .from(storedHistory.blocksWithKnownTransactions)
      .pipe(
        rxop.mergeMap(
          (blockToCheck) => this.fetchTransactions(account, blockToCheck, blockToCheck),
          5,
        ),
        rxop.reduce<readonly Transaction[]>(uncurry(ArrayOps.concat), []),
      )
      .toPromise()

    return {
      lastCheckedBlock: storedHistory.lastCheckedBlock,
      transactions,
    }
  }

  private scanBlockchain(
    account: Address,
    history$: Observable<TransactionHistory>,
  ): Observable<FetchedBatch> {
    return rx.combineLatest([history$, this.bestBlock$]).pipe(
      rxop.map(
        ([lastHistory, bestBlock]) =>
          [this.getScanRange(lastHistory.lastCheckedBlock), bestBlock] as [BatchRange, BlockHeader],
      ),
      rxop.filter(([range, bestBlock]) => {
        const topRange = this.getNewRange(bestBlock.number)

        return range.max <= topRange.max
      }),
      rxop.map(([range, _]) => range),
      rxop.distinctUntilChanged(BatchRange.isEqual),
      rxop.concatMap((range) => this.fetchBatch(account, range)),
    )
  }

  private watchForNewTransactions(account: Address): Observable<FetchedBatch> {
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
    return BatchRange.ofSizeFromMax(bestBlockNumber, this.smallBlocksBatchSize)
  }

  private getScanRange(lastCheckedBlockNumber: number): BatchRange {
    return BatchRange.ofSize(lastCheckedBlockNumber + 1, this.blocksBatchSize)
  }

  private fetchBatch(account: Address, range: BatchRange): Observable<FetchedBatch> {
    return rx
      .defer(() => {
        this.logger.info('making a request for transactions', account, range)

        return rx.from(this.fetchTransactions(account, range.min, range.max))
      })
      .pipe(
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
