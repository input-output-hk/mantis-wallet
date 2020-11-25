import * as _ from 'lodash/fp'
import {Transaction} from '../../common/wallet-state'

export interface TransactionHistory {
  lastCheckedBlock: number
  transactions: readonly Transaction[]
}
export const empty: TransactionHistory = {lastCheckedBlock: 0, transactions: []}

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
  //For now let's pick just the batch best block number
  return (a.batchBestBlock > b.batchBestBlock ? a : b).tx
}

export const merge = (a: TransactionHistory, b: TransactionHistory): TransactionHistory => {
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
