import {useState} from 'react'
import BigNumber from 'bignumber.js'
import _ from 'lodash/fp'
import * as t from 'io-ts'
import {createContainer} from 'unstated-next'
import {Option, some, none, getOrElse, isSome, isNone} from 'fp-ts/lib/Option'
import Web3 from 'web3'
import {EncryptedKeystoreV3Json, Account as Web3Account} from 'web3-core'
import {NumberFromHexString, BigNumberFromHexString} from './io-helpers'
import {Transaction, FeeLevel} from '../web3'
import {rendererLog} from './logger'
import {Store, createInMemoryStore} from './store'
import {usePersistedState} from './hook-utils'
import {prop} from '../shared/utils'
import {createTErrorRenderer} from './i18n'

// API Types

const SynchronizationStatusOffline = t.type({
  mode: t.literal('offline'),
  currentBlock: NumberFromHexString,
})

const SynchronizationStatusOnline = t.type({
  mode: t.literal('online'),
  currentBlock: NumberFromHexString,
  highestKnownBlock: NumberFromHexString,
  percentage: t.number,
})

const SynchronizationStatus = t.union([SynchronizationStatusOffline, SynchronizationStatusOnline])

const FeeEstimatesForIoType: Record<FeeLevel, typeof BigNumberFromHexString> = {
  low: BigNumberFromHexString,
  medium: BigNumberFromHexString,
  high: BigNumberFromHexString,
}
const FeeEstimates = t.type(FeeEstimatesForIoType)

// FIXME ETCM-113 we might need a different object for this
export type SynchronizationStatus = t.TypeOf<typeof SynchronizationStatus>

export type TransparentAccount = {
  address: string
  index: number
  balance: BigNumber
  tokens: Record<string, BigNumber>
}

export type PrivateAddress = {
  address: string
  index: number
}

export interface CallParams {
  from: ['Wallet', string] | 'Wallet' // WalletName, optional: transparentAddress (if missing, new one will be generated)
  to?: string // transparent contract address in bech32 format
  value?: string // value of transaction
  gasLimit?: string // decimal as string, if not specified, default is equal to 90000
  gasPrice?: string // decimal as string, if not specified, default is equal to 20000000000
  nonce?: string // If not specified, default is equal to current transparent sender nonce
  data?: string // smart contract deployment/calling code
}

export type FeeEstimates = t.TypeOf<typeof FeeEstimates>

// TransactionStatus

interface TransactionPending {
  readonly status: 'TransactionPending'
}

interface TransactionFailed {
  readonly status: 'TransactionFailed'
  readonly message: string
}

interface TransactionOk {
  readonly status: 'TransactionOk'
  readonly message: string
}

export type TransactionStatus = TransactionPending | TransactionFailed | TransactionOk
export type CallTxStatuses = Record<string, TransactionStatus> // by txHash

// States

export interface InitialState {
  walletStatus: 'INITIAL'
  refreshSyncStatus: () => Promise<void>
}

export interface LoadingState {
  walletStatus: 'LOADING'
}

export interface LoadedState {
  walletStatus: 'LOADED'
  syncStatus: SynchronizationStatus
  privateAccounts: PrivateAddress[]
  getOverviewProps: () => Overview
  callTxStatuses: CallTxStatuses
  reset: () => void
  remove: (password: string) => Promise<boolean>
  getSpendingKey: (password: string) => Promise<string>
  lock: (password: string) => Promise<boolean>
  generatePrivateAccount: () => Promise<void>
  refreshSyncStatus: () => Promise<void>
  sendTransaction: (recipient: string, amount: number, fee: number, memo: string) => Promise<string>
  calculateGasPrice: (fee: number, callParams: CallParams) => Promise<number>
  estimateCallFee(callParams: CallParams): Promise<FeeEstimates>
  estimateTransactionFee(amount: BigNumber): Promise<FeeEstimates>
  addTokenToTrack: (tokenAddress: string) => void
  addTokensToTrack: (tokenAddresses: string[]) => void
}

export interface LockedState {
  walletStatus: 'LOCKED'
  reset: () => void
  remove: (password: string) => Promise<boolean>
  unlock: (password: string) => Promise<boolean>
}

export interface NoWalletState {
  walletStatus: 'NO_WALLET'
  reset: () => void
  addAccount: (name: string, privateKey: string, password: string) => Promise<void>
}

export interface ErrorState {
  walletStatus: 'ERROR'
  error: Error
  reset: () => void
  remove: (password: string) => Promise<boolean>
}

export type WalletStatus = 'INITIAL' | 'LOADING' | 'LOADED' | 'LOCKED' | 'NO_WALLET' | 'ERROR'
export type WalletData =
  | InitialState
  | LoadingState
  | LoadedState
  | LockedState
  | NoWalletState
  | ErrorState

interface Overview {
  transparentBalance: BigNumber
  availableBalance: BigNumber
  pendingBalance: BigNumber
  transactions: Transaction[]
}

interface Account {
  name: string
  address: string
  keystore: EncryptedKeystoreV3Json
}

export interface StoreWalletData {
  wallet: {
    accounts: Account[]
  }
}

export const defaultWalletData: StoreWalletData = {
  wallet: {
    accounts: [],
  },
}

interface WalletStateParams {
  walletStatus: WalletStatus
  web3: Web3
  store: Store<StoreWalletData>
  error: Option<Error>
  syncStatus: Option<SynchronizationStatus>
  totalBalance: Option<BigNumber>
  availableBalance: Option<BigNumber>
  privateAccounts: Option<PrivateAddress[]>
  transactions: Option<Transaction[]>
  callTxStatuses: CallTxStatuses
  isMocked: boolean
}

const DEFAULT_STATE: WalletStateParams = {
  walletStatus: 'INITIAL',
  web3: new Web3(),
  store: createInMemoryStore(defaultWalletData),
  error: none,
  syncStatus: none,
  totalBalance: none,
  availableBalance: none,
  privateAccounts: none,
  transactions: none,
  callTxStatuses: {},
  isMocked: false, // FIXME ETCM-116 it would be nicer if could go without this flag
}

export const canRemoveWallet = (
  walletState: WalletData,
): walletState is LoadedState | LockedState | ErrorState =>
  walletState.walletStatus === 'LOADED' ||
  walletState.walletStatus === 'LOCKED' ||
  walletState.walletStatus === 'ERROR'

function useWalletState(initialState?: Partial<WalletStateParams>): WalletData {
  const _initialState = _.merge(DEFAULT_STATE)(initialState)
  const {web3, isMocked} = _initialState

  // wallet
  const [accounts, setAccounts] = usePersistedState(_initialState.store, ['wallet', 'accounts'])
  const [currentAccountOption, setCurrentAccountOption] = useState<Option<string>>(
    accounts.length > 0 ? some(accounts[0].address) : none,
  )

  // wallet status
  const [walletStatus_, setWalletStatus] = useState<WalletStatus>(_initialState.walletStatus)
  const [errorOption, setError] = useState<Option<Error>>(_initialState.error)
  const [syncStatusOption, setSyncStatus] = useState<Option<SynchronizationStatus>>(
    _initialState.syncStatus,
  )

  // balance
  const [totalBalanceOption, setTotalBalance] = useState<Option<BigNumber>>(
    _initialState.totalBalance,
  )
  const [availableBalanceOption, setAvailableBalance] = useState<Option<BigNumber>>(
    _initialState.availableBalance,
  )

  // transactions
  const [transactionsOption, setTransactions] = useState<Option<Transaction[]>>(
    _initialState.transactions,
  )
  const [callTxStatuses] = useState<CallTxStatuses>(_initialState.callTxStatuses)

  // addresses / accounts
  const [privateAccountsOption, setPrivateAccounts] = useState<Option<PrivateAddress[]>>(
    _initialState.privateAccounts,
  )

  // tokens
  const [trackedTokens, setTrackedTokens] = useState<string[]>([])

  const privateAccounts = getOrElse((): PrivateAddress[] => [])(privateAccountsOption)

  const getOverviewProps = (): Overview => {
    const transactions = getOrElse((): Transaction[] => [])(transactionsOption)
    const transparentBalance = new BigNumber(0)
    const totalBalance = getOrElse((): BigNumber => new BigNumber(0))(totalBalanceOption)
    const availableBalance = getOrElse((): BigNumber => new BigNumber(0))(availableBalanceOption)
    const pendingBalance = totalBalance.minus(availableBalance)

    return {
      transparentBalance,
      availableBalance,
      pendingBalance,
      transactions,
    }
  }

  const isLoaded = (): boolean =>
    isSome(totalBalanceOption) &&
    isSome(availableBalanceOption) &&
    isSome(transactionsOption) &&
    isSome(privateAccountsOption) &&
    isSome(syncStatusOption)

  const walletStatus =
    walletStatus_ === 'LOADING' && (isMocked || isLoaded()) ? 'LOADED' : walletStatus_

  const syncStatus = getOrElse(
    (): SynchronizationStatus => ({
      mode: 'offline',
      currentBlock: -1,
    }),
  )(syncStatusOption)

  const reset = (): void => {
    setWalletStatus('INITIAL')
    setTotalBalance(none)
    setAvailableBalance(none)
    setTransactions(none)
    setError(none)
    setSyncStatus(none)
  }

  const handleError = (e: Error): void => {
    rendererLog.error(e)
    setError(some(e))
    if (!isMocked) setWalletStatus('ERROR')
  }

  const error = getOrElse((): Error => Error('Unknown error'))(errorOption)

  const getCurrentAccount = (): string => {
    if (isNone(currentAccountOption)) {
      throw createTErrorRenderer(['wallet', 'error', 'noAccountWasSelected'])
    }
    return currentAccountOption.value
  }

  const loadPrivateAccounts = async (): Promise<void> => {
    const address = getCurrentAccount()
    setPrivateAccounts(
      some([
        {
          address,
          index: 0,
        },
      ]),
    )
  }

  // const getTokens = async (
  //   address: string, tokens = trackedTokens,
  // ): Promise<Record<string, BigNumber>> => {
  //   const tokenBalances = await Promise.all(
  //     tokens.map(async (contractAddress) => {
  //       const data = ERC20Contract.balanceOf.getData(bech32toHex(address))
  //       try {
  //         const balance = await eth.call(
  //           {
  //             to: contractAddress,
  //             data,
  //           },
  //           'latest',
  //         )
  //         return [contractAddress, new BigNumber(balance)]
  //       } catch (err) {
  //         rendererLog.error(err)
  //         return [contractAddress, new BigNumber(0)]
  //       }
  //     }),
  //   )
  //   return _.fromPairs(tokenBalances)
  // }

  const loadBalance = async (): Promise<void> => {
    const address = getCurrentAccount()
    const balance = await web3.eth.getBalance(address, 'latest')
    setTotalBalance(some(new BigNumber(balance)))
    setAvailableBalance(some(new BigNumber(balance)))
  }

  // const _getCallTransactionStatus = async (transactionHash: string): Promise<TransactionStatus> => {
  //   // (private) Get status of contract call transaction

  //   const rawTx = await web3.eth.getTransaction(transactionHash)
  //   if (rawTx === null) {
  //     // null if not found or failed
  //     return {
  //       status: 'TransactionFailed',
  //       message: 'Transaction failed before reaching the contract. Try again with a higher fee.',
  //     }
  //   }

  //   const receipt = await web3.eth.getTransactionReceipt(transactionHash)
  //   if (receipt === null) {
  //     return {status: 'TransactionPending'}
  //   }

  //   const status = 'TransactionOk'
  //   const message = ''

  //   // FIXME ETCM-114 investigate tx receipt in web3
  //   // const status = parseInt(receipt.statusCode, 16) === 1 ? 'TransactionOk' : 'TransactionFailed'
  //   // const message =
  //   //   status === 'TransactionFailed' && receipt.returnData
  //   //     ? returnDataToHumanReadable(receipt.returnData)
  //   //     : receipt.returnData

  //   return {status, message}
  // }

  // const _updateCallTxStatuses = async (transactions: Transaction[]): Promise<void> => {
  //   const hashesToCheck = transactions
  //     .filter((tx) => tx.txDetails.txType === 'call')
  //     .map((tx) => tx.hash)

  //   const newStatuses = await Promise.all(
  //     hashesToCheck.map(async (txHash) => {
  //       const newStatus = await _getCallTransactionStatus(txHash)
  //       return [txHash, newStatus]
  //     }),
  //   )

  //   setCallTxStatuses(_.fromPairs(newStatuses))
  // }

  const loadTransactionHistory = async (): Promise<void> => setTransactions(some([])) // FIXME ETCM-114 load true transactions

  const load = (
    loadFns: Array<() => Promise<void>> = [
      loadTransactionHistory,
      loadBalance,
      loadPrivateAccounts,
    ],
  ): void => {
    setWalletStatus('LOADING')

    loadFns.forEach((fn) => fn().catch(handleError))
  }

  const getSyncStatus = async (): Promise<SynchronizationStatus> => {
    if (isMocked) {
      return {
        mode: 'offline',
        currentBlock: 0,
      }
    }

    const syncing = await web3.eth.isSyncing()

    if (syncing === true) {
      throw new Error('Unexpected')
    }

    if (syncing === false) {
      const currentBlock = await web3.eth.getBlockNumber()
      return {
        mode: 'offline',
        currentBlock: currentBlock,
      }
    }

    const allBlocks = syncing.HighestBlock - syncing.StartingBlock

    return {
      mode: 'online',
      currentBlock: syncing.CurrentBlock,
      highestKnownBlock: syncing.HighestBlock,
      percentage: allBlocks ? (syncing.CurrentBlock - syncing.StartingBlock) / allBlocks : 0,
    }
  }

  const refreshSyncStatus = async (): Promise<void> => {
    if (!isMocked && isNone(currentAccountOption)) {
      return setWalletStatus('NO_WALLET')
    }

    // account should be accessible through address too
    // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
    // @ts-ignore
    if (!isMocked && web3.eth.accounts.wallet[currentAccountOption.value] == null) {
      return setWalletStatus('LOCKED')
    }

    try {
      const newSyncStatus = await getSyncStatus()
      load()
      if (!_.isEqual(newSyncStatus)(syncStatus)) {
        if (
          newSyncStatus.mode === 'online' &&
          newSyncStatus.currentBlock > newSyncStatus.highestKnownBlock
        ) {
          // FIXME: PM-2352 highestKnownBlock should be >= currentBlock
          setSyncStatus(
            some({
              ...newSyncStatus,
              highestKnownBlock: newSyncStatus.currentBlock,
            }),
          )
        } else {
          setSyncStatus(some(newSyncStatus))
        }
      }
    } catch (e) {
      handleError(e)
    }
  }

  const generatePrivateAccount = (): Promise<void> => Promise.resolve()

  const sendTransaction = async (
    recipient: string,
    amount: number,
    fee: number,
    memo: string,
  ): Promise<string> => {
    rendererLog.log(recipient, amount, fee, ['text', memo], false)
    return '' // FIXME ETCM-111 fix send tx
  }

  const calculateGasPrice = (_fee: number, _callParams: CallParams): Promise<number> =>
    Promise.resolve(1) // FIXME ETCM-111 fix calculate gas

  const addAccount = async (name: string, privateKey: string, password: string): Promise<void> => {
    web3.eth.accounts.wallet.add(privateKey)

    const keystore = web3.eth.accounts.encrypt(privateKey, password)
    const address = `0x${keystore.address}`
    setAccounts([...accounts, {name, address, keystore}])
    setCurrentAccountOption(some(address))
    reset()
  }

  const decryptCurrentAccount = (password: string): Web3Account => {
    const currentAddress = getCurrentAccount()

    const storedAccount = accounts.find(({address}) => address === currentAddress)

    if (!storedAccount) {
      throw createTErrorRenderer(['wallet', 'error', 'accountNotFound'], {
        replace: {currentAddress, accounts: accounts.map(prop('address')).join(', ')},
      })
    }

    try {
      return web3.eth.accounts.decrypt(storedAccount.keystore, password)
    } catch (e) {
      rendererLog.error(e)
      throw createTErrorRenderer(['common', 'error', 'wrongPassword'])
    }
  }

  const getCurrentPrivateKey = (password: string): string =>
    decryptCurrentAccount(password).privateKey

  const unlock = async (password: string): Promise<boolean> => {
    const privateKey = getCurrentPrivateKey(password)
    web3.eth.accounts.wallet.add(privateKey)
    reset()
    return true
  }

  const lock = async (password: string): Promise<boolean> => {
    const currentAddress = getCurrentAccount()
    decryptCurrentAccount(password)

    const locked = web3.eth.accounts.wallet.remove(currentAddress)
    if (locked) reset()
    return locked
  }

  const remove = async (password: string): Promise<boolean> => {
    const currentAddress = getCurrentAccount()
    decryptCurrentAccount(password)

    web3.eth.accounts.wallet.remove(currentAddress)
    reset()
    setAccounts(accounts.filter(({address}) => address !== currentAddress))
    setCurrentAccountOption(none)
    setWalletStatus('NO_WALLET')
    return true
  }

  const getSpendingKey = async (password: string): Promise<string> => {
    return getCurrentPrivateKey(password) // FIXME ETCM-113 refactor this
  }

  const estimateFees = (
    _txType: 'redeem' | 'transfer',
    _amount: BigNumber,
  ): Promise<FeeEstimates> =>
    Promise.resolve({
      low: new BigNumber(0.01),
      medium: new BigNumber(0.02),
      high: new BigNumber(0.03),
    }) // FIXME ETCM-111 fix estimate fees

  const estimateTransactionFee = (amount: BigNumber): Promise<FeeEstimates> =>
    estimateFees('transfer', amount)

  const estimateCallFee = (_callParams: CallParams): Promise<FeeEstimates> =>
    Promise.resolve({
      low: new BigNumber(0.01),
      medium: new BigNumber(0.02),
      high: new BigNumber(0.03),
    }) // FIXME ETCM-111 fix estimate fees

  const addTokenToTrack = (tokenAddress: string): void => {
    if (!trackedTokens.includes(tokenAddress)) {
      const newTrackedTokens = [...trackedTokens, tokenAddress]
      setTrackedTokens(newTrackedTokens)
    }
  }

  const addTokensToTrack = (tokenAddresses: string[]): void => {
    const notTrackedAddresses = _.difference(tokenAddresses)(trackedTokens)
    if (notTrackedAddresses.length > 0) {
      const newTrackedTokens = [...trackedTokens, ...notTrackedAddresses]
      setTrackedTokens(newTrackedTokens)
    }
  }

  return {
    walletStatus,
    error,
    syncStatus,
    getOverviewProps,
    reset,
    generatePrivateAccount,
    refreshSyncStatus,
    sendTransaction,
    calculateGasPrice,
    estimateCallFee,
    estimateTransactionFee,
    unlock,
    lock,
    remove,
    getSpendingKey,
    privateAccounts,
    callTxStatuses,
    addTokenToTrack,
    addTokensToTrack,
    addAccount,
  }
}

export const WalletState = createContainer(useWalletState)
