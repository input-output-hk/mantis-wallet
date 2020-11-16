import {useState} from 'react'
import BigNumber from 'bignumber.js'
import _ from 'lodash/fp'
import {createContainer} from 'unstated-next'
import {Option, some, none, getOrElse, isSome, isNone} from 'fp-ts/lib/Option'
import {pipe} from 'fp-ts/lib/pipeable'
import Web3 from 'web3'
import {fromUnixTime} from 'date-fns'
import {
  EncryptedKeystoreV3Json,
  TransactionConfig,
  Account as Web3Account,
  Transaction as Web3Transaction,
} from 'web3-core'
import {rendererLog} from './logger'
import {Store, createInMemoryStore} from './store'
import {usePersistedState} from './hook-utils'
import {prop} from '../shared/utils'
import {createTErrorRenderer} from './i18n'
import {toHex} from './util'
import {asWei, Wei, asEther} from './units'

interface SynchronizationStatusOffline {
  mode: 'offline'
  currentBlock: number
}

interface SynchronizationStatusOnline {
  mode: 'online'
  currentBlock: number
  highestKnownBlock: number
  percentage: number
}

export type SynchronizationStatus = SynchronizationStatusOffline | SynchronizationStatusOnline

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
  status: 'pending' | 'confirmed' | 'persisted' | 'failed'
  contractAddress: string | null
}

const DEPTH_FOR_PERSISTENCE = 12
export const TRANSFER_GAS_LIMIT = 21000
export const MIN_GAS_PRICE = asWei(1)

// States

export interface InitialState {
  walletStatus: 'INITIAL'
  refreshSyncStatus: () => Promise<void>
}

export interface LoadingState {
  walletStatus: 'LOADING'
}

interface SendTransactionParams {
  recipient: string
  amount: Wei
  gasPrice: Wei
  gasLimit: number
  password: string
  data?: string
  nonce: number
}

export interface LoadedState {
  walletStatus: 'LOADED'
  syncStatus: SynchronizationStatus
  accounts: Account[]
  getOverviewProps: () => Overview
  reset: () => void
  remove: (password: string) => Promise<boolean>
  getPrivateKey: (password: string) => Promise<string>
  generateAccount: () => Promise<void>
  refreshSyncStatus: () => Promise<void>
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

export type WalletStatus = 'INITIAL' | 'LOADING' | 'LOADED' | 'NO_WALLET' | 'ERROR'
export type WalletData = InitialState | LoadingState | LoadedState | NoWalletState | ErrorState

interface Overview {
  availableBalance: Wei
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
  }
}

export const defaultWalletData: StoreWalletData = {
  wallet: {
    accounts: [],
    addressBook: {},
  },
}

interface WalletStateParams {
  walletStatus: WalletStatus
  web3: Web3
  store: Store<StoreWalletData>
  error: Option<Error>
  syncStatus: Option<SynchronizationStatus>
  totalBalance: Option<Wei>
  availableBalance: Option<Wei>
  accounts: Option<Account[]>
  transactions: Option<Transaction[]>
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
  accounts: none,
  transactions: none,
  isMocked: false, // FIXME ETCM-116 it would be nicer if could go without this flag
}

export const canRemoveWallet = (walletState: WalletData): walletState is LoadedState | ErrorState =>
  walletState.walletStatus === 'LOADED' || walletState.walletStatus === 'ERROR'

export const getNextNonce = (transactions: Transaction[]): number =>
  transactions.filter((tx) => tx.direction === 'outgoing').length

export const getPendingBalance = (transactions: Transaction[]): BigNumber =>
  transactions
    .filter((tx) => tx.status === 'pending' && tx.direction === 'outgoing')
    .map((tx) => tx.value.plus(tx.fee))
    .reduce((prev, curr) => prev.plus(curr), new BigNumber(0))

export const canResetWallet = (
  walletState: WalletData,
): walletState is LoadedState | ErrorState | NoWalletState =>
  walletState.walletStatus === 'LOADED' ||
  walletState.walletStatus === 'ERROR' ||
  walletState.walletStatus === 'NO_WALLET'

const getStatus = (
  currentBlock: number,
  txBlock: number | null,
  isPending: boolean,
): Transaction['status'] => {
  if (isPending || txBlock === null) return 'pending'
  return currentBlock - txBlock >= DEPTH_FOR_PERSISTENCE ? 'persisted' : 'confirmed'
}

function useWalletState(initialState?: Partial<WalletStateParams>): WalletData {
  const _initialState = _.merge(DEFAULT_STATE)(initialState)
  const {web3, isMocked} = _initialState

  // wallet
  const [storedAccounts, setStoredAccounts] = usePersistedState(_initialState.store, [
    'wallet',
    'accounts',
  ])
  const [currentAddressOption, setCurrentAddressOption] = useState<Option<string>>(
    storedAccounts.length > 0 ? some(storedAccounts[0].address) : none,
  )

  // wallet status
  const [walletStatus_, setWalletStatus] = useState<WalletStatus>(_initialState.walletStatus)
  const [errorOption, setError] = useState<Option<Error>>(_initialState.error)
  const [syncStatusOption, setSyncStatus] = useState<Option<SynchronizationStatus>>(
    _initialState.syncStatus,
  )

  // balance
  const [totalBalanceOption, setTotalBalance] = useState<Option<Wei>>(_initialState.totalBalance)
  const [availableBalanceOption, setAvailableBalance] = useState<Option<Wei>>(
    _initialState.availableBalance,
  )

  // transactions
  const [transactionsOption, setTransactions] = useState<Option<Transaction[]>>(
    _initialState.transactions,
  )

  // addresses / accounts
  const [accountsOption, setAccounts] = useState<Option<Account[]>>(_initialState.accounts)

  // address book
  const [addressBook, updateAddressBook] = usePersistedState(_initialState.store, [
    'wallet',
    'addressBook',
  ])

  const editContact = (address: string, label: string): void =>
    updateAddressBook((prevContacts) => ({...prevContacts, [address.toLowerCase()]: label}))

  const deleteContact = (address: string): void =>
    updateAddressBook((prevContacts) => _.unset(address)(prevContacts))

  // tokens
  const [trackedTokens, setTrackedTokens] = useState<string[]>([])

  const accounts = getOrElse((): Account[] => [])(accountsOption)

  const getOverviewProps = (): Overview => {
    const transactions = getOrElse((): Transaction[] => [])(transactionsOption)
    const totalBalance = getOrElse(() => asWei(0))(totalBalanceOption)
    const availableBalance = getOrElse(() => asWei(0))(availableBalanceOption)
    const pendingBalance = asWei(totalBalance.minus(availableBalance))

    return {
      availableBalance,
      pendingBalance,
      transactions,
    }
  }

  const isLoaded = (): boolean =>
    isSome(totalBalanceOption) &&
    isSome(availableBalanceOption) &&
    isSome(transactionsOption) &&
    isSome(accountsOption) &&
    isSome(syncStatusOption)

  const walletStatus =
    walletStatus_ === 'LOADING' && (isMocked || isLoaded()) ? 'LOADED' : walletStatus_

  const syncStatus = getOrElse(
    (): SynchronizationStatus => ({
      mode: 'offline',
      currentBlock: -1,
    }),
  )(syncStatusOption)

  const reset = (status: WalletStatus = 'INITIAL'): void => {
    setWalletStatus(status)
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

  const getCurrentAddress = (): string => {
    if (isNone(currentAddressOption)) {
      throw createTErrorRenderer(['wallet', 'error', 'noAccountWasSelected'])
    }
    return currentAddressOption.value
  }

  const decryptCurrentAccount = (password: string): Web3Account => {
    const currentAddress = getCurrentAddress()

    const storedAccount = storedAccounts.find(({address}) => address === currentAddress)

    if (!storedAccount) {
      throw createTErrorRenderer(['wallet', 'error', 'accountNotFound'], {
        replace: {currentAddress, accounts: storedAccounts.map(prop('address')).join(', ')},
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

  const loadAccounts = async (): Promise<void> => {
    const address = getCurrentAddress()
    const balance = await web3.eth.getBalance(address, 'latest')
    setAccounts(
      some([
        {
          address,
          index: 0,
          balance: asWei(balance),
          tokens: {},
        },
      ]),
    )
  }

  // FIXME ETCM-115
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

  const loadBalance = async (transactions: Transaction[], currentBlock: number): Promise<void> => {
    const address = getCurrentAddress()
    const balance = asWei(await web3.eth.getBalance(address, currentBlock))
    const pendingBalance = getPendingBalance(transactions)

    setAvailableBalance(some(asWei(balance.minus(pendingBalance))))
    setTotalBalance(some(balance))
  }

  const getTimestamp = async (blockNumber: number | null): Promise<Date | null> => {
    if (blockNumber === null) return null
    const {timestamp} = await web3.eth.getBlock(blockNumber, true)
    return _.isString(timestamp) ? fromUnixTime(parseInt(timestamp, 16)) : fromUnixTime(timestamp)
  }

  const loadTransactionHistory = async (): Promise<void> => {
    const currentAddress = getCurrentAddress()
    const currentBlock = await web3.eth.getBlockNumber()

    const web3transactions: Web3Transaction[] = await web3.eth.getAccountTransactions(
      currentAddress,
      0,
      currentBlock,
    )

    const transactions = await Promise.all(
      web3transactions.map(
        async ({
          from,
          to,
          hash,
          blockNumber,
          value,
          gas,
          gasPrice,
          pending,
          isOutgoing,
        }: Web3Transaction): Promise<Transaction> => {
          const receipt = await web3.eth.getTransactionReceipt(hash)
          return {
            from,
            to,
            hash,
            blockNumber,
            timestamp: await getTimestamp(blockNumber),
            value: asWei(value),
            gas,
            gasPrice: asWei(gasPrice),
            gasUsed: pending ? null : receipt.gasUsed,
            fee: isOutgoing
              ? asWei(new BigNumber(gasPrice).times(pending ? gas : receipt.gasUsed))
              : asWei(0),
            direction: isOutgoing ? 'outgoing' : 'incoming',
            status: getStatus(currentBlock, blockNumber, pending || false),
            contractAddress: receipt?.contractAddress || null,
          }
        },
      ),
    )

    setTransactions(some(transactions))
    await loadBalance(transactions, currentBlock)
  }

  const load = (
    loadFns: Array<() => Promise<void>> = [loadTransactionHistory, loadAccounts],
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
      throw Error('Unexpected')
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
    if (!isMocked) {
      if (isNone(currentAddressOption)) {
        return setWalletStatus('NO_WALLET')
      }
    }

    try {
      const newSyncStatus = await getSyncStatus()
      load()
      if (!_.isEqual(newSyncStatus)(syncStatus)) {
        if (
          newSyncStatus.mode === 'online' &&
          newSyncStatus.currentBlock > newSyncStatus.highestKnownBlock
        ) {
          // FIXME: highestKnownBlock should be >= currentBlock
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

  const generateAccount = (): Promise<void> => Promise.resolve()

  const getGasPrice = async (): Promise<Wei> => asWei(await web3.eth.getGasPrice())

  const sendTransaction = async ({
    recipient,
    amount,
    gasPrice,
    gasLimit,
    password,
    data,
    nonce,
  }: SendTransactionParams): Promise<void> => {
    const txConfig: TransactionConfig = {
      nonce,
      to: recipient,
      from: getCurrentAddress(),
      value: toHex(amount),
      gas: gasLimit,
      gasPrice: toHex(gasPrice),
      data,
    }

    const privateKey = getCurrentPrivateKey(password)
    const tx = await web3.eth.accounts.signTransaction(txConfig, privateKey)
    if (tx.rawTransaction === undefined) {
      throw createTErrorRenderer(['wallet', 'error', 'couldNotSignTransaction'])
    }
    web3.eth.sendSignedTransaction(tx.rawTransaction) // ETCM-134
  }

  const doTransfer = async (
    recipient: string,
    amount: Wei,
    fee: Wei,
    password: string,
  ): Promise<void> => {
    const transactions = getOrElse((): Transaction[] => [])(transactionsOption)
    const nonce = getNextNonce(transactions)

    sendTransaction({
      recipient,
      amount,
      gasPrice: pipe(
        fee,
        (b) => b.dividedBy(TRANSFER_GAS_LIMIT),
        (b) => b.integerValue(),
        (b) => BigNumber.max(b, MIN_GAS_PRICE),
        asWei,
      ),
      gasLimit: TRANSFER_GAS_LIMIT,
      nonce,
      password,
    })
  }

  const addAccount = async (name: string, privateKey: string, password: string): Promise<void> => {
    const keystore = web3.eth.accounts.encrypt(privateKey, password)
    const address = `0x${keystore.address}`
    setStoredAccounts([...storedAccounts, {name, address, keystore}])
    setCurrentAddressOption(some(address))
    reset()
  }

  const remove = async (password: string): Promise<boolean> => {
    const currentAddress = getCurrentAddress()
    decryptCurrentAccount(password)

    reset('NO_WALLET')
    setStoredAccounts(storedAccounts.filter(({address}) => address !== currentAddress))
    setCurrentAddressOption(none)
    return true
  }

  const getPrivateKey = (password: string): Promise<string> =>
    Promise.resolve(getCurrentPrivateKey(password))

  const estimateTransactionFee = async (): Promise<FeeEstimates> => {
    const gasPrice = await getGasPrice()
    const useMinGasPrice = (gasPrice: BigNumber): BigNumber =>
      BigNumber.max(gasPrice, MIN_GAS_PRICE)
    return {
      low: asWei(useMinGasPrice(gasPrice.times(0.75)).times(TRANSFER_GAS_LIMIT)),
      medium: asWei(useMinGasPrice(gasPrice).times(TRANSFER_GAS_LIMIT)),
      high: asWei(
        useMinGasPrice(gasPrice)
          .times(TRANSFER_GAS_LIMIT)
          .times(1.25),
      ),
    }
  }

  const estimateCallFee = (_txConfig: TransactionConfig): Promise<FeeEstimates> =>
    Promise.resolve({
      low: asEther(0.01),
      medium: asEther(0.02),
      high: asEther(0.03),
    }) // FIXME ETCM-115 fix estimate fees

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
    generateAccount,
    refreshSyncStatus,
    sendTransaction,
    doTransfer,
    estimateCallFee,
    estimateTransactionFee,
    remove,
    getPrivateKey,
    accounts,
    addTokenToTrack,
    addTokensToTrack,
    addAccount,
    addressBook,
    editContact,
    deleteContact,
  }
}

export const WalletState = createContainer(useWalletState)
