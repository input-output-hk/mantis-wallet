import * as _ from 'lodash/fp'
import BigNumber from 'bignumber.js'
import {TransactionReceipt} from 'web3-eth'
import {option, readonlyArray} from 'fp-ts'
import {pipe} from 'fp-ts/lib/pipeable'
import {AccountTransaction} from '../../web3'
import {asWei, Wei} from '../../common/units'

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

const DEPTH_FOR_PERSISTENCE = 12
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

const intersectionsAndDiffs = <T>(
  a: Set<T>,
  b: Set<T>,
): {aOnly: Set<T>; common: Set<T>; bOnly: Set<T>} => {
  const aOnly = new Set<T>()
  const bOnly = new Set<T>()
  const common = new Set<T>()

  a.forEach((aItem) => {
    if (b.has(aItem)) {
      common.add(aItem)
    } else {
      aOnly.add(aItem)
    }
  })
  b.forEach((bItem) => {
    if (!common.has(bItem)) {
      bOnly.add(bItem)
    }
  })

  return {aOnly, bOnly, common}
}

type TxAndBatchBlock = {tx: Transaction; batchBestBlock: number}
const resolveTxConflict = (a: TxAndBatchBlock, b: TxAndBatchBlock): Transaction => {
  //If one of versions is pending and other not - let's pick non pending one, otherwise one with higher block
  const nonPendingTx = [a.tx, b.tx].filter((tx) => tx.status != 'pending')
  if (nonPendingTx.length == 1) {
    return nonPendingTx[0]
  }

  return (a.batchBestBlock > b.batchBestBlock ? a : b).tx
}

export const mergeBatch = (history: TransactionHistory, transactions: readonly Transaction[]): TransactionHistory => {
  const aMapByHash = new Map(a.transactions.map((tx) => [tx.hash, tx]))
  const bMapByHash = new Map(b.transactions.map((tx) => [tx.hash, tx]))
  const {aOnly, bOnly, common} = intersectionsAndDiffs(
    new Set(aMapByHash.keys()),
    new Set(bMapByHash.keys()),
  )

  // Non-null assertions are used only when getting elements from map that we know they exist there
  /* eslint-disable @typescript-eslint/no-non-null-assertion */
  const aTransactions = [...aOnly].map((hash) => aMapByHash.get(hash)!)
  const bTransactions = [...bOnly].map((hash) => bMapByHash.get(hash)!)
  const commonResolved = [...common].map((hash) => {
    const aWithBatchBlock: TxAndBatchBlock = {
      tx: aMapByHash.get(hash)!,
      batchBestBlock: a.lastCheckedBlock,
    }
    const bWithBatchBlock: TxAndBatchBlock = {
      tx: bMapByHash.get(hash)!,
      batchBestBlock: b.lastCheckedBlock,
    }

    return resolveTxConflict(aWithBatchBlock, bWithBatchBlock)
  })
  /* eslint-enable @typescript-eslint/no-non-null-assertion */

  return {
    lastCheckedBlock: Math.max(a.lastCheckedBlock, b.lastCheckedBlock),
    transactions: _.sortBy(
      (tx) => tx.blockNumber,
      aTransactions.concat(bTransactions).concat(commonResolved),
    ),
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
