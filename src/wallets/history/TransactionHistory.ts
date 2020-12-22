import BigNumber from 'bignumber.js'
import {TransactionReceipt} from 'web3-eth'
import {eq, map, option, ord, readonlyArray, set} from 'fp-ts'
import {pipe} from 'fp-ts/lib/pipeable'
import {AccountTransaction} from '../../web3'
import {asWei} from '../../common/units'
import {BatchRange} from './BatchRange'
import {through} from '../../shared/utils'
import {ArrayOps, OptionOps, SetOps} from '../../shared'
import {Transaction} from './Transaction'

const DEPTH_FOR_PERSISTENCE = 12

export interface FetchedBatch {
  blockRange: BatchRange
  transactions: readonly Transaction[]
}

export type GetReceipt = (txHash: string) => Promise<TransactionReceipt>

export interface TransactionHistory {
  lastCheckedBlock: number
  transactions: readonly Transaction[]
}
export const TransactionHistory = (() => {
  const empty: TransactionHistory = {lastCheckedBlock: 0, transactions: []}

  /**
   * Since Mantis may have transaction added to some block and at the same time have it in pending pool, we need to
   * remove pending transactions that are added to some block already
   */
  const deduplicatePending = (
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

  const mergeBatch = (history: TransactionHistory, batch: FetchedBatch): TransactionHistory => {
    const historyMapByHash = new Map(history.transactions.map((tx) => [tx.hash, tx]))
    const batchMapByHash = new Map(batch.transactions.map((tx) => [tx.hash, tx]))
    const {aOnly: historyOnly, bOnly: batchOnly, common} = SetOps.intersectionsAndDiffs(
      eq.eqString,
      new Set(historyMapByHash.keys()),
      new Set(batchMapByHash.keys()),
    )

    const transactionsFromHistory = pipe(
      historyOnly,
      set.toArray(ord.ordString),
      readonlyArray.chain(
        through(
          (hash) => map.lookup(eq.eqString)(hash, historyMapByHash),
          option.map((tx) => (Transaction.isPending(tx) ? Transaction.fail(tx) : tx)),
          OptionOps.toArray,
        ),
      ),
    )
    const transactionsFromBatch = pipe(
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
      readonlyArray.sort(Transaction),
    )

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

  const transactionFromResponse = async (
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

  return {
    transactionFromResponse,
    mergeBatch,
    empty,
    deduplicatePending,
  }
})()
