import {TransactionHistory} from './TransactionHistory'

export interface StoredHistory {
  lastCheckedBlock: number
  blocksWithKnownTransactions: readonly number[]
}
export const empty: StoredHistory = {lastCheckedBlock: 0, blocksWithKnownTransactions: []}
export const fromHistory = (txHistory: TransactionHistory): StoredHistory => {
  return {
    lastCheckedBlock: txHistory.lastCheckedBlock,
    blocksWithKnownTransactions: [
      ...new Set(
        txHistory.transactions
          .map((tx) => tx.blockNumber)
          .filter((nr): nr is number => nr !== null),
      ),
    ],
  }
}
