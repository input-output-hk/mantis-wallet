import * as Comlink from 'comlink'
import {MockWorker} from './stubs'

export interface BigNumberJSON {
  s: number
  e: number
  c: number[]
}

export interface Balance {
  availableBalance: BigNumberJSON
  totalBalance: BigNumberJSON
}

export interface TransparentAddress {
  address: string
  index: number
}

export interface Transaction {
  hash: string // Hash of transaction
  txDirection: 'incoming' | 'outgoing'
  txStatus: {
    status: 'confirmed' | 'pending' | 'persisted'
    atBlock?: string // hexadecimal value representing block at which transaction took place
  }
  txValue: string
  txDetails: {
    txType: 'transfer' | 'coinbase' | 'redeem' | 'call'
  }
}

interface PassphraseSecrets {
  passphrase: string
}

export interface SpendingKey {
  spendingKey: string
}

export interface SeedPhrase {
  seedPhrase: string[]
}

export interface Account {
  wallet: string
  address: string
  locked: boolean
}

export type PaginatedCallable<T> = (count: number, drop: number) => T[]

export interface WalletAPI {
  // wallet basic actions
  create(secrets: PassphraseSecrets): SpendingKey & SeedPhrase
  unlock(secrets: PassphraseSecrets): boolean
  lock(secrets: PassphraseSecrets): boolean
  restore(secrets: (SpendingKey | SeedPhrase) & PassphraseSecrets): boolean
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
}

interface Web3API {
  midnight: {
    wallet: WalletAPI
  }
}

// for testing: ReactDOM doesn't know about workers
if (window.Worker === undefined) {
  // eslint-disable-next-line
  window.Worker = MockWorker
}

const worker = new Worker('./web3.worker.js', {type: 'module'})

export const web3 = Comlink.wrap<Web3API>(worker)
