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

export interface Account {
  wallet: string
  address: string
  locked: boolean
}

export interface TransparentAddress {
  address: string
  index: number
}

// Transaction

interface ConfirmedTxStatus {
  status: 'confirmed'
  atBlock: string
}
interface PersistedTxStatus {
  status: 'persisted'
  atBlock: string
}

export type TxStatus = 'pending' | 'failed' | ConfirmedTxStatus | PersistedTxStatus

interface RedeemTxDetails {
  txType: 'redeem'
  usedTransparentAccountIndex: number
}

interface CallTxDetails {
  txType: 'call'
  usedTransparentAccountIndex: number
  transparentTransactionHash: string
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

interface Web3API {
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

const worker = new Worker('./web3.worker.js', {type: 'module'})
worker.postMessage(['configure', config.rpcAddress])

export const web3 = Comlink.wrap<Web3API>(worker)
