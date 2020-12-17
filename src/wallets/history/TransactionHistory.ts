import BigNumber from 'bignumber.js'
import {TransactionReceipt} from 'web3-eth'
import {array, eq, map, option, ord, readonlyArray, set} from 'fp-ts'
import {pipe} from 'fp-ts/lib/pipeable'
import {Ord} from 'fp-ts/lib/Ord'
import {Ordering} from 'fp-ts/lib/Ordering'
import {AccountTransaction} from '../../web3'
import {asWei, Wei} from '../../common/units'
import {BatchRange} from './BatchRange'
import {prop, through} from '../../shared/utils'
import {ArrayOps, OptionOps, SetOps} from '../../shared'

export interface Transaction {
  from: string
  to: string | null
  hash: string
  blockNumber: number | null
  timestamp: Date | null
  value: Wei
  gasPrice: Wei
  gasUsed: number | null
  fee: Wei
  gas: number
  direction: 'outgoing' | 'incoming'
  status: 'pending' | 'confirmed' | 'persisted_depth' | 'persisted_checkpoint' | 'failed'
  contractAddress: string | null
}
const isPending = (tx: Transaction): boolean => tx.status == 'pending'
const fail = (tx: Transaction): Transaction => ({...tx, status: 'failed'})
export const transactionOrd: Ord<Transaction> = (() => {
  const nullToInfinity = (x: number | null): number =>
    pipe(
      x,
      option.fromNullable,
      option.getOrElse(() => Number.POSITIVE_INFINITY),
    )

  const byBlockNumberOrd: Ord<Transaction> = pipe(
    ord.ordNumber,
    ord.contramap(nullToInfinity),
    ord.contramap(prop('blockNumber')),
  )
  const statusToNumber = (status: Transaction['status']): number => {
    switch (status) {
      case 'pending':
        return 0
      case 'failed':
        return 1
      case 'confirmed':
        return 2
      case 'persisted_depth':
        return 3
      case 'persisted_checkpoint':
        return 4
    }
  }
  const byTxStatusOrd: Ord<Transaction> = pipe(
    ord.ordNumber,
    ord.contramap(statusToNumber),
    ord.contramap(prop('status')),
  )
  //These 2 are quite irrelevant, but quite useful for tests determinism
  const byTxDirectionOrd: Ord<Transaction> = pipe(ord.ordString, ord.contramap(prop('direction')))
  const byTxHashOrd: Ord<Transaction> = pipe(ord.ordString, ord.contramap(prop('hash')))

  const ordMonoid = ord.getMonoid<Transaction>()
  return pipe(
    [byBlockNumberOrd, byTxStatusOrd, byTxDirectionOrd, byTxHashOrd],
    array.reduce(ordMonoid.empty, ordMonoid.concat),
  )
})()

const DEPTH_FOR_PERSISTENCE = 12

export interface FetchedBatch {
  blockRange: BatchRange
  transactions: readonly Transaction[]
}

export interface TransactionHistory {
  lastCheckedBlock: number
  transactions: readonly Transaction[]
}
export const empty: TransactionHistory = {lastCheckedBlock: 0, transactions: []}

/**
 * Since Mantis may have transaction added to some block and at the same time have it in pending pool, we need to
 * remove pending transactions that are added to some block already
 */
export const deduplicatePending = (
  transactions: readonly AccountTransaction[],
): readonly AccountTransaction[] => {
  const confirmedHashes = pipe(
    transactions,
    readonlyArray.filterMap((tx) =>
      pipe(
        tx.blockNumber,
        option.fromNullable,
        option.map(() => tx.hash),
      ),
    ),
    (hashes) => new Set(hashes),
  )

  return transactions.filter((tx) => !tx.isPending || !confirmedHashes.has(tx.hash))
}

export const mergeBatch = (
  history: TransactionHistory,
  batch: FetchedBatch,
): TransactionHistory => {
  const historyMapByHash = new Map(history.transactions.map((tx) => [tx.hash, tx]))
  const batchMapByHash = new Map(batch.transactions.map((tx) => [tx.hash, tx]))
  const {aOnly: historyOnly, bOnly: batchOnly, common} = SetOps.intersectionsAndDiffs(
    eq.eqString,
    new Set(historyMapByHash.keys()),
    new Set(batchMapByHash.keys()),
  )

  const transactionsFromHistory: readonly Transaction[] = pipe(
    historyOnly,
    set.toArray(ord.ordString),
    readonlyArray.chain(
      through(
        (hash) => map.lookup(eq.eqString)(hash, historyMapByHash),
        option.map((tx) => (isPending(tx) ? fail(tx) : tx)),
        OptionOps.toArray,
      ),
    ),
  )
  const transactionsFromBatch: readonly Transaction[] = pipe(
    batchOnly,
    set.union(eq.eqString)(common),
    set.toArray(ord.ordString),
    readonlyArray.chain(
      through((hash) => map.lookup(eq.eqString)(hash, batchMapByHash), OptionOps.toArray),
    ),
  )
  const finalTransactions = pipe(
    transactionsFromBatch,
    ArrayOps.concat(transactionsFromHistory),
    ArrayOps.sorted(transactionOrd),
  )

  //
  // // Non-null assertions are used only when getting elements from map that we know they exist there
  // /* eslint-disable @typescript-eslint/no-non-null-assertion */
  // const aTransactions = [...aOnly].map((hash) => aMapByHash.get(hash)!)
  // const bTransactions = [...bOnly].map((hash) => bMapByHash.get(hash)!)
  // const commonResolved = [...common].map((hash) => {
  //   const aWithBatchBlock: TxAndBatchBlock = {
  //     tx: aMapByHash.get(hash)!,
  //     batchBestBlock: a.lastCheckedBlock,
  //   }
  //   const bWithBatchBlock: TxAndBatchBlock = {
  //     tx: bMapByHash.get(hash)!,
  //     batchBestBlock: b.lastCheckedBlock,
  //   }
  //
  //   return resolveTxConflict(aWithBatchBlock, bWithBatchBlock)
  // })
  // /* eslint-enable @typescript-eslint/no-non-null-assertion */
  //
  // return {
  //   lastCheckedBlock: Math.max(a.lastCheckedBlock, b.lastCheckedBlock),
  //   transactions: _.sortBy(
  //     (tx) => tx.blockNumber,
  //     aTransactions.concat(bTransactions).concat(commonResolved),
  //   ),
  // }

  const lastCheckedBlock = [BatchRange.follows, BatchRange.contains]
    .map((check) => check(history.lastCheckedBlock, batch.blockRange))
    .includes(true)
    ? batch.blockRange.max
    : history.lastCheckedBlock

  return {
    lastCheckedBlock,
    transactions: finalTransactions,
  }
}

const getTxStatus = (tx: AccountTransaction, currentBlock: number): Transaction['status'] => {
  if (tx.isPending || tx.blockNumber === null) return 'pending'
  else if (tx.isCheckpointed) return 'persisted_checkpoint'
  else if (currentBlock - tx.blockNumber >= DEPTH_FOR_PERSISTENCE) return 'persisted_depth'
  else return 'confirmed'
}

export type GetReceipt = (txHash: string) => Promise<TransactionReceipt>
export const transactionFromResponse = async (
  tx: AccountTransaction,
  currentBlock: number,
  getReceipt: GetReceipt,
): Promise<Transaction> => ({
  ...tx,
  timestamp: tx.timestamp || null,
  gasUsed: tx.gasUsed || null,
  value: asWei(tx.value),
  gasPrice: asWei(tx.gasPrice),
  fee: tx.isOutgoing ? asWei(new BigNumber(tx.gasPrice).times(tx.gasUsed || tx.gas)) : asWei(0),
  direction: tx.isOutgoing ? 'outgoing' : 'incoming',
  status: getTxStatus(tx, currentBlock),
  contractAddress: tx.to == null ? (await getReceipt(tx.hash))?.contractAddress || null : null,
})
