//
// Transaction
//

// Tx statuses

interface ConfirmedTxStatus {
  status: 'confirmed'
  atBlock: string
  timestamp: number
}
interface PersistedTxStatus {
  status: 'persisted'
  atBlock: string
  timestamp: number
}

export type TxStatus = 'pending' | 'failed' | ConfirmedTxStatus | PersistedTxStatus
export type TxStatusString = 'pending' | 'failed' | 'confirmed' | 'persisted'

// Tx details

interface RedeemTxDetails {
  txType: 'redeem'
  usedTransparentAccountIndex: number
}

interface TransparentTransaction {
  nonce: string // hex string
  gasPrice: number
  gasLimit: string // hex string
  receivingAddress: string | null // bech32 string
  sendingAddress: string // bech32 string
  value: string // hex string
  payload: string // hex string
}

export interface CallTxDetails {
  txType: 'call'
  usedTransparentAccountIndexes: number[]
  transparentTransactionHash: string
  transparentTransaction: TransparentTransaction
}

interface TransferTxDetails {
  txType: 'transfer'
  memo: ['text', string] | ['binary', string] | null
}

interface CoinbaseTxDetails {
  txType: 'coinbase'
}

// These can be either 'incoming', 'outgoing' or 'internal'
// Coinbase type is only 'incoming'
// Redeem type is only 'internal'
export type TxDetailsIncAndOut = CallTxDetails | TransferTxDetails

interface BaseTransaction {
  hash: string
  txStatus: TxStatus
}

// Main tx types

interface IncomingTransaction extends BaseTransaction {
  txDirection: 'incoming'
  txValue: string
  txDetails: CoinbaseTxDetails | TxDetailsIncAndOut
}

interface OutgoingTransaction extends BaseTransaction {
  txDirection: 'outgoing'
  txValue: {value: string; fee: string}
  txDetails: TxDetailsIncAndOut
}

interface InternalTransaction extends BaseTransaction {
  txDirection: 'internal'
  txValue: {value: string; fee: string}
  txDetails: TxDetailsIncAndOut | RedeemTxDetails
}

export type Transaction = IncomingTransaction | OutgoingTransaction | InternalTransaction

//
// Synchronization status
//

export interface SynchronizationStatusOffline {
  mode: 'offline'
  currentBlock: string
}

export interface SynchronizationStatusOnline {
  mode: 'online'
  currentBlock: string
  highestKnownBlock: string
  percentage: number
}

export type RawSynchronizationStatus = SynchronizationStatusOffline | SynchronizationStatusOnline

//
// Helper types
//

export type PaginatedCallable<T> = (count: number, drop: number) => T[]

export const allFeeLevels = ['low', 'medium', 'high'] as const
export type FeeLevel = typeof allFeeLevels[number]
