import * as Comlink from 'comlink'
import {MockWorker} from './stubs'
import {config} from './config/renderer'
import {ChainId} from './pob/chains'

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
export type TxStatusString = 'pending' | 'failed' | 'confirmed' | 'persisted'

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
  usedTransparentAccountIndexes: number[]
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

// Contracts

export interface CallParams {
  from: ['Wallet', string] | 'Wallet' // WalletName, optional: transparentAddress (if missing, new one will be generated)
  to?: string // transparent contract address in bech32 format
  value?: string // value of transaction
  gasLimit: string // decimal as string, if not specified, default is equal to 90000
  gasPrice: string // decimal as string, if not specified, default is equal to 20000000000
  nonce?: string // If not specified, default is equal to current transparent sender nonce
  data?: string // smart contract deployment/calling code
}

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

export interface EtcPrivateKeySecrets {
  etcPrivateKey: string
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

export type RawSynchronizationStatus = SynchronizationStatusOffline | SynchronizationStatusOnline

// Glacier Drop

export interface RawBalanceWithProof {
  balance: string // hex number string
  proof: string // hex string
}

export interface RawAuthorizationSignature {
  r: string // hex string
  s: string // hex string
  v: number
}

export interface NewMineStarted {
  status: 'NewMineStarted'
  estimatedTime: number
  estimatedBlockOfTxInclusion: string // hex number string
  message: string
}

export interface MiningInProgress {
  status: 'MiningInProgress'
  currentNonce: string // hex number string
  message: string
}

export type MineResponse = NewMineStarted | MiningInProgress

interface MiningSuccessful {
  status: 'MiningSuccessful'
  nonce: string // hex number string
  mixHash: string // hex string
}

export type GetMiningStateResponse = MiningInProgress | MiningSuccessful

// Helpers

export type PaginatedCallable<T> = (count: number, drop: number) => T[]

export const allFeeLevels = ['low', 'medium', 'high'] as const
export type FeeLevel = typeof allFeeLevels[number]

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
  getTransparentWalletBalance(address: string): string // returns hex string

  // transactions
  redeemValue(address: string, amount: number, fee: number): string
  sendTransaction(recipient: string, amount: number, fee: number): string
  getTransactionHistory: PaginatedCallable<Transaction>
  callContract(callParams: CallParams): string
  estimateFees: {
    (txType: 'CallTx', callParams: CallParams): Record<FeeLevel, string>
    (txType: 'RedeemTx' | 'TransferTx', amount: number): Record<FeeLevel, string>
    // The following definition shouldn't be needed, but since WalletAPI is wrapped
    // into Comlink.Remote type, it cannot handle overloads and takes only the last type
    (txType: 'RedeemTx' | 'TransferTx' | 'CallTx', amountOrParams: number | CallParams): Record<
      FeeLevel,
      string
    >
  }

  // transparent addresses
  listTransparentAddresses: PaginatedCallable<TransparentAddress>
  generateTransparentAddress(): TransparentAddress

  listAccounts(): Account[]
  getSynchronizationStatus(): RawSynchronizationStatus
  getBurnAddress(address: string, chainId: number, reward: number, autoConversion: boolean): string
}

export interface GlacierDropAPI {
  getEtcSnapshotBalanceWithProof(etcAddress: string): RawBalanceWithProof
  authorizationSign(
    transparentAddress: string,
    secrets: EtcPrivateKeySecrets,
  ): RawAuthorizationSignature
  mine(
    externalAmount: string,
    etcAddress: string,
    unlockingStartBlock: number,
    unlockingEndBlock: number,
  ): MineResponse
  getMiningState(): GetMiningStateResponse
}

export interface ERC20Contract {
  balanceOf: (address: string) => BigNumberJSON
}

// This interface isn't complete, check documentation if it needs to be expanded:
// https://github.com/ethereum/wiki/wiki/JSON-RPC#eth_gettransactionbyhash
export interface EthTransaction {
  hash: string | null
  blockNumber: number | null
}

export interface TransactionReceipt {
  transactionHash: string // hex string
  transactionIndex: string // hex num string
  blockNumber: string // hex num string
  blockHash: string // hex string
  cumulativeGasUsed: string // hex num string
  gasUsed: string // hex num string
  contractAddress: null
  logs: []
  statusCode: string // hex num string
  returnData: string // hex string
}

export interface EthApi {
  getTransaction(hash: string): EthTransaction | null
  getTransactionReceipt(transactionHash: string): TransactionReceipt | null
  // used to get constant values from contracts:
  call(callParams: Partial<CallParams>, version: 'latest'): string
  getGasPriceEstimation(): Record<FeeLevel, number>
}

export interface Web3API {
  eth: EthApi
  midnight: {
    wallet: WalletAPI
    glacierDrop: GlacierDropAPI
  }
  version: {
    ethereum: string
  }
  erc20: Record<ChainId, ERC20Contract>
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
