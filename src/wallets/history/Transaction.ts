import {Ord} from 'fp-ts/Ord'
import {pipe} from 'fp-ts/pipeable'
import {array, ord} from 'fp-ts'
import {Wei} from '../../common/units'
import {nullToInfinity, prop} from '../../shared/utils'

export type TransactionStatus =
  | 'pending'
  | 'confirmed'
  | 'persisted_depth'
  | 'persisted_checkpoint'
  | 'failed'
const TransactionStatus = (() => {
  const statusToNumber = (status: TransactionStatus): number => {
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

  const transactionStatusOrd: Ord<TransactionStatus> = pipe(
    ord.ordNumber,
    ord.contramap(statusToNumber),
  )

  return transactionStatusOrd
})()

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
  status: TransactionStatus
  contractAddress: string | null
}
export const Transaction = (() => {
  const isPending = (tx: Transaction): boolean => tx.status == 'pending'
  const fail = (tx: Transaction): Transaction => ({...tx, status: 'failed'})
  const transactionOrd: Ord<Transaction> = (() => {
    const byBlockNumberOrd: Ord<Transaction> = pipe(
      ord.ordNumber,
      ord.contramap(nullToInfinity),
      ord.contramap(prop('blockNumber')),
    )

    const byTxStatusOrd: Ord<Transaction> = pipe(TransactionStatus, ord.contramap(prop('status')))
    //These 2 are irrelevant, but quite useful for tests determinism
    const byTxDirectionOrd: Ord<Transaction> = pipe(ord.ordString, ord.contramap(prop('direction')))
    const byTxHashOrd: Ord<Transaction> = pipe(ord.ordString, ord.contramap(prop('hash')))

    const ordMonoid = ord.getMonoid<Transaction>()
    return pipe(
      [byBlockNumberOrd, byTxStatusOrd, byTxDirectionOrd, byTxHashOrd],
      array.reduce(ordMonoid.empty, ordMonoid.concat),
    )
  })()

  return {
    ...transactionOrd,
    fail,
    isPending,
  }
})()
