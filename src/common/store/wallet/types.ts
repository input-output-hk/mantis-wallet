import BigNumber from 'bignumber.js'
import {TransactionConfig, EncryptedKeystoreV3Json} from 'web3-core'
import {Option} from 'fp-ts/Option'
import {Wei} from '../../units'
import {MantisWeb3} from '../../../web3'
import {Store} from '../store'

interface SynchronizationStatusOffline {
  mode: 'offline'
  currentBlock: number
  lastNewBlockTimestamp: number
}

interface SynchronizationStatusOnline {
  mode: 'online'
  currentBlock: number
  highestKnownBlock: number
  pulledStates: number
  knownStates: number
  percentage: number
  lastNewBlockTimestamp: number
}

interface SynchronizationStatusSynced {
  mode: 'synced'
  currentBlock: number
  lastNewBlockTimestamp: number
}

export type SynchronizationStatus =
  | SynchronizationStatusOffline
  | SynchronizationStatusOnline
  | SynchronizationStatusSynced

export interface Account {
  address: string
  index: number
  balance: Wei
  tokens: Record<string, BigNumber>
}

export const allFeeLevels = ['low', 'medium', 'high'] as const
export type FeeLevel = typeof allFeeLevels[number]
export type FeeEstimates = Record<FeeLevel, Wei>

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

export interface SendTransactionParams {
  recipient: string
  amount: Wei
  gasPrice: Wei
  gasLimit: number
  password: string
  data?: string
  nonce: number
}

// States

interface CommonState {
  tncAccepted: boolean
  setTncAccepted: (value: boolean) => void
  syncStatus: SynchronizationStatus
  error: Option<Error>
}

export interface InitialState extends CommonState {
  walletStatus: 'INITIAL'
}

export interface LoadingState extends CommonState {
  walletStatus: 'LOADING'
}

export interface LoadedState extends CommonState {
  walletStatus: 'LOADED'
  error: Option<Error>
  accounts: Account[]
  getOverviewProps: () => Overview
  reset: () => void
  remove: (password: string) => Promise<boolean>
  getPrivateKey: (password: string) => Promise<string>
  generateAccount: () => Promise<void>
  getNextNonce: () => Promise<number>
  doTransfer: (recipient: string, amount: Wei, fee: Wei, password: string) => Promise<void>
  sendTransaction: (params: SendTransactionParams) => Promise<void>
  estimateCallFee(txConfig: TransactionConfig): Promise<FeeEstimates>
  estimateTransactionFee(): Promise<FeeEstimates>
  addTokenToTrack: (tokenAddress: string) => void
  addTokensToTrack: (tokenAddresses: string[]) => void
  // address book methods:
  addressBook: Record<string, string>
  editContact(address: string, label: string): void
  deleteContact(address: string): void
}

export interface NoWalletState extends CommonState {
  walletStatus: 'NO_WALLET'
  reset: () => void
  addAccount: (name: string, privateKey: string, password: string) => Promise<void>
}

export type WalletStatus = 'INITIAL' | 'LOADING' | 'LOADED' | 'NO_WALLET'
export type WalletData = InitialState | LoadingState | LoadedState | NoWalletState

export interface Overview {
  availableBalance: Option<Wei>
  pendingBalance: Wei
  transactions: Transaction[]
}

interface StoredAccount {
  name: string
  address: string
  keystore: EncryptedKeystoreV3Json
}

export interface StoreWalletData {
  wallet: {
    accounts: StoredAccount[]
    addressBook: Record<string, string>
    tncAccepted: boolean
  }
}

export interface WalletStateParams {
  walletStatus: WalletStatus
  web3: MantisWeb3
  store: Store<StoreWalletData>
  syncStatus: Option<SynchronizationStatus>
  totalBalance: Option<Wei>
  availableBalance: Option<Wei>
  accounts: Option<Account[]>
  transactions: Option<Transaction[]>
  isMocked: boolean
}
