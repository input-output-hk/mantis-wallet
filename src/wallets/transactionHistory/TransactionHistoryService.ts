import * as rx from 'rxjs'
import {Observable} from 'rxjs'
import * as rxop from 'rxjs/operators'
import {BlockHeader} from 'web3-eth'
import * as StoredHistory from './StoredHistory'
import * as TransactionHistory from './TransactionHistory'
import {Transaction} from '../../common/wallet-state'
import {through} from '../../shared/utils'

export type Address = string
export type GetAccountTransactions = (
  account: Address,
  fromBlock: number,
  toBlock: number,
) => Promise<Transaction[]>
export type GetStoredHistory = () => Promise<StoredHistory.StoredHistory>
export type StoreHistory = (sh: StoredHistory.StoredHistory) => Promise<void>

interface BatchRange {
  min: number
  max: number
}
const BatchRange = new (class {
  ofSize = (min: number, size: number): BatchRange => ({min, max: min + size})
  ofSizefromMax = (max: number, size: number): BatchRange => ({min: max - size, max})
  lower = (a: BatchRange, b: BatchRange): BatchRange => (a.min <= b.min ? a : b)
})()

const tapEval = <A>(evalCb: (a: A) => Promise<void>): rx.OperatorFunction<A, A> =>
  rxop.concatMap((a: A) => evalCb(a).then(() => a))

export class TransactionHistoryService {
  constructor(
    private blocksBatchSize: number,
    private smallBlocksBatchSize: number,
    private getTransactions: GetAccountTransactions,
    private getStoredHistory: GetStoredHistory,
    private storeHistory: StoreHistory,
    private bestBlock$: Observable<BlockHeader>,
  ) {}

  start(account: Address): Observable<TransactionHistory.TransactionHistory> {
    return rx.from(this.init(account)).pipe(
      rxop.concatMap((initialHistory) => {
        return rx.concat(
          rx.of(initialHistory),
          this.fetchMissingTransactions(account, initialHistory),
        )
      }),
      tapEval(through(StoredHistory.fromHistory, this.storeHistory)),
    )
  }

  private async init(account: Address): Promise<TransactionHistory.TransactionHistory> {
    const storedHistory = await this.getStoredHistory()

    const transactions = await rx
      .from(storedHistory.blocksWithKnownTransactions)
      .pipe(
        rxop.mergeMap(
          (blockToCheck) => this.getTransactions(account, blockToCheck, blockToCheck + 1),
          5,
        ),
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
    const historySubject = new rx.BehaviorSubject(initialHistory)

    rx.combineLatest([historySubject.asObservable(), this.bestBlock$])
      .pipe(
        rxop.concatMap(([lastHistory, bestBlock]) => {
          const nextIterationBatch = BatchRange.ofSize(
            lastHistory.lastCheckedBlock,
            this.blocksBatchSize,
          )
          const bestBlockBatch = BatchRange.ofSizefromMax(
            bestBlock.number,
            this.smallBlocksBatchSize,
          )

          const batchToPick = BatchRange.lower(nextIterationBatch, bestBlockBatch)

          return this.getTransactions(account, batchToPick.min, batchToPick.max).then(
            (transactions) => {
              const receivedHistory: TransactionHistory.TransactionHistory = {
                lastCheckedBlock: batchToPick.max,
                transactions,
              }
              return TransactionHistory.merge(receivedHistory, lastHistory)
            },
          )
        }),
      )
      .subscribe(historySubject)

    return historySubject.asObservable()
  }
}
