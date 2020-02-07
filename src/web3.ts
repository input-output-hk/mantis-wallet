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

export interface TransparentAddress {
  address: string
  index: number
}

// FIXME: Separate different tx types
export interface Transaction {
  hash: string // Hash of transaction
  txDirection: 'incoming' | 'outgoing'
  txStatus:
    | 'pending'
    | {
        status: 'confirmed' | 'persisted'
        atBlock?: string // hexadecimal value representing block at which transaction took place
      }
  txValue: string | {value: string; fee: string}
  txDetails: {
    txType: 'transfer' | 'coinbase' | 'redeem' | 'call'
  }
}

export interface PassphraseSecrets {
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
