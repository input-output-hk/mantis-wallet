import * as Comlink from 'comlink'
import {MockWorker} from './stubs'
import {config} from './config/renderer'

export interface BigNumberJSON {
  s: number
  e: number
  c: number[]
}

export interface Balance {
  availableBalance: BigNumberJSON
  totalBalance: BigNumberJSON
}

// Accounts

export interface Account {
  wallet: string
  locked: boolean
  address?: string
}

// Transparent addresses

export interface TransparentAddress {
  address: string
  index: number
}

// Transaction

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

// Tx details
interface RedeemTxDetails {
  txType: 'redeem'
  usedTransparentAccountIndex: number
}

interface TransparentTransaction {
  nonce: string // hex string
  gasPrice: string // hex string
  gasLimit: string // hex string
  receivingAddress: string | null // bech32 string
  sendingAddress: string // bech32 string
  value: string // hex string
  payload: string // hex string
}

interface CallTxDetails {
  txType: 'call'
  usedTransparentAccountIndex: number
  transparentTransactionHash: string
  transparentTransaction: TransparentTransaction
}

interface TransferTxDetails {
  txType: 'transfer'
}

interface CoinbaseTxDetails {
  txType: 'coinbase'
}

// These can be either 'incoming' or 'outgoing'
// Coinbase type is only 'incoming'
export type TxDetailsIncAndOut = RedeemTxDetails | CallTxDetails | TransferTxDetails

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

export type Transaction = IncomingTransaction | OutgoingTransaction

// Secrets

export interface PassphraseSecrets {
  passphrase: string
}

export interface SpendingKey {
  spendingKey: string
}

export interface SeedPhrase {
  seedPhrase: string[]
}

// SynchronizationStatus

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

export type SynchronizationStatus = SynchronizationStatusOffline | SynchronizationStatusOnline

export type PaginatedCallable<T> = (count: number, drop: number) => T[]

export interface WalletAPI {
  // wallet basic actions
  create(secrets: PassphraseSecrets): SpendingKey & SeedPhrase
  unlock(secrets: PassphraseSecrets): boolean
  lock(secrets: PassphraseSecrets): boolean
  restoreFromSeedPhrase(secrets: SeedPhrase & PassphraseSecrets): boolean
  restoreFromSpendingKey(secrets: SpendingKey & PassphraseSecrets): boolean
  remove(secrets: PassphraseSecrets): boolean

  // balances
  getBalance(): Balance
  getTransparentWalletBalance(address: string): Balance

  // transactions
  sendTransaction(recipient: string, amount: number, fee: number): string
  getTransactionHistory: PaginatedCallable<Transaction>

  // transparent addresses
  listTransparentAddresses: PaginatedCallable<TransparentAddress>
  generateTransparentAddress(): TransparentAddress

  listAccounts(): Account[]
  getSynchronizationStatus(): SynchronizationStatus
  getBurnAddress(address: string, chainId: number, reward: number, autoConversion: boolean): string
}

export interface Web3API {
  midnight: {
    wallet: WalletAPI
  }
  version: {
    ethereum: string
  }
}

// for testing: ReactDOM doesn't know about workers
if (window.Worker === undefined) {
  // eslint-disable-next-line
  window.Worker = MockWorker
}

// should be done here to properly bundle them
const web3Worker = new Worker('./web3.worker.js', {type: 'module'})

export const makeWeb3Worker = (worker: Worker = web3Worker): Comlink.Remote<Web3API> => {
  worker.postMessage(['configure', config.rpcAddress])
  return Comlink.wrap<Web3API>(worker)
}
