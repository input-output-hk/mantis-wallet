import {useEffect, useState} from 'react'
import BigNumber from 'bignumber.js'
import _ from 'lodash/fp'
import {createContainer} from 'unstated-next'
import {getOrElse, isNone, isSome, none, Option, some} from 'fp-ts/lib/Option'
import {pipe} from 'fp-ts/lib/pipeable'
import {Account as Web3Account, EncryptedKeystoreV3Json, TransactionConfig} from 'web3-core'
import {array, option} from 'fp-ts'
import {Observable, of} from 'rxjs'
import {rendererLog} from './logger'
import {createInMemoryStore, Store} from './store'
import {usePersistedState, useRecurringTimeout} from './hook-utils'
import {prop} from '../shared/utils'
import {createTErrorRenderer} from './i18n'
import {ensure0x, toHex, useObservable} from './util'
import {asEther, asWei, Wei} from './units'
import {CustomErrors, defaultWeb3, MantisWeb3} from '../web3'
import {
  defaultTxHistoryStoreData,
  Transaction,
  TransactionHistoryService,
  TxHistoryStoreData,
} from '../wallets/history'
import {BackendState} from './backend-state'

const EXPECTED_LAST_BLOCK_CHANGE_SECONDS = 60

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

export const TRANSFER_GAS_LIMIT = 21000
export const MIN_GAS_PRICE = asWei(1)

interface SendTransactionParams {
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

interface Overview {
  availableBalance: Option<Wei>
  pendingBalance: Wei
  transactions: readonly Transaction[]
}

interface StoredAccount {
  name: string
  address: string
  keystore: EncryptedKeystoreV3Json
}

export interface StoreWalletData {
  wallet: TxHistoryStoreData & {
    accounts: StoredAccount[]
    addressBook: Record<string, string>
    tncAccepted: boolean
  }
}

export const defaultWalletData: StoreWalletData = {
  wallet: {
    ...defaultTxHistoryStoreData,
    accounts: [],
    addressBook: {},
    tncAccepted: false,
  },
}

interface WalletStateParams {
  walletStatus: WalletStatus
  web3: MantisWeb3
  store: Store<StoreWalletData>
  backendState: Pick<BackendState, 'networkName'>
  txHistory: TransactionHistoryService
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
  web3: defaultWeb3(),
  store: createInMemoryStore(defaultWalletData),
  backendState: {networkName: 'fake'},
  txHistory: TransactionHistoryService.fake,
  error: none,
  syncStatus: none,
  totalBalance: none,
  availableBalance: none,
  accounts: none,
  transactions: none,
  isMocked: false, // FIXME ETCM-116 it would be nicer if could go without this flag
}

export const canRemoveWallet = (walletState: WalletData): walletState is LoadedState =>
  walletState.walletStatus === 'LOADED'

export const getPendingBalance = (transactions: readonly Transaction[]): BigNumber =>
  transactions
    .filter((tx) => tx.status === 'pending' && tx.direction === 'outgoing')
    .map((tx) => tx.value.plus(tx.fee))
    .reduce((prev, curr) => prev.plus(curr), new BigNumber(0))

export const canResetWallet = (
  walletState: WalletData,
): walletState is LoadedState | NoWalletState =>
  walletState.walletStatus === 'LOADED' || walletState.walletStatus === 'NO_WALLET'

function useWalletState(initialState?: Partial<WalletStateParams>): WalletData {
  const _initialState = _.merge(DEFAULT_STATE)(initialState)
  const {web3, isMocked, txHistory} = _initialState

  // wallet
  const [storedAccounts, setStoredAccounts] = usePersistedState(_initialState.store, [
    'wallet',
    'accounts',
  ])
  const [currentAddressOption, setCurrentAddressOption] = useState<Option<string>>(
    storedAccounts.length > 0 ? some(storedAccounts[0].address) : none,
  )

  const [initialBlockNumber, setInitialBlockNumber] = useState<number | undefined>(undefined)

  // wallet status
  const [walletStatus_, setWalletStatus] = useState<WalletStatus>(_initialState.walletStatus)
  const [syncStatusOption, setSyncStatus] = useState<Option<SynchronizationStatus>>(
    _initialState.syncStatus,
  )

  const [error, setError] = useState<Option<Error>>(none)

  // balance
  const [totalBalanceOption, setTotalBalance] = useState<Option<Wei>>(_initialState.totalBalance)
  const [availableBalanceOption, setAvailableBalance] = useState<Option<Wei>>(
    _initialState.availableBalance,
  )

  // transactions
  const [historyObservable, setHistoryObservable] = useState<Observable<readonly Transaction[]>>(
    of([]),
  )
  useEffect(() => {
    pipe(
      currentAddressOption,
      option.fold(
        () => of([]),
        (account) => txHistory.watchAccount(_initialState.backendState.networkName, account),
      ),
      setHistoryObservable,
    )
  }, [currentAddressOption, _initialState.backendState.networkName])
  const transactions = useObservable([], historyObservable)

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

  const [tncAccepted, setTncAccepted] = usePersistedState(_initialState.store, [
    'wallet',
    'tncAccepted',
  ])

  const accounts = getOrElse((): Account[] => [])(accountsOption)

  const getOverviewProps = (): Overview => {
    const totalBalance = getOrElse(() => asWei(0))(totalBalanceOption)
    const availableBalance = getOrElse(() => asWei(0))(availableBalanceOption)
    const pendingBalance = asWei(totalBalance.minus(availableBalance))

    return {
      availableBalance: availableBalanceOption,
      pendingBalance,
      transactions,
    }
  }

  const isLoaded = (): boolean => isSome(accountsOption)

  const walletStatus =
    walletStatus_ === 'LOADING' && (isMocked || isLoaded()) ? 'LOADED' : walletStatus_

  const syncStatus = getOrElse(
    (): SynchronizationStatus => ({
      mode: 'offline',
      currentBlock: 0,
      lastNewBlockTimestamp: 0,
    }),
  )(syncStatusOption)

  const reset = (status: WalletStatus = 'INITIAL'): void => {
    rendererLog.debug(`new walletStatus ${status}`)
    setWalletStatus(status)
    setTotalBalance(none)
    setAvailableBalance(none)
  }

  const handleRefreshError = (e: Error): void => {
    rendererLog.error(e)
    // eslint-disable-next-line no-console
    console.error(e)
    setError(option.some(e))
  }

  const getCurrentAddress = (): string => {
    if (isNone(currentAddressOption)) {
      if (isMocked) return '0x0'
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

  const fetchBalance = async (address: string): Promise<Option<Wei>> =>
    web3.eth
      .getBalance(address, 'latest')
      .then(asWei)
      .then(
        (balance) => option.some(balance),
        (err) =>
          pipe(
            err.data as unknown,
            CustomErrors.decode,
            option.fromEither,
            option.filter((customErrors) => customErrors.some((error) => error.code === 100)),
            option.fold(
              () => Promise.reject(err),
              (_) => Promise.resolve(option.none),
            ),
          ),
      )

  const loadAccounts = async (): Promise<void> => {
    const address = getCurrentAddress()
    const balance = await fetchBalance(address)
    setAccounts(
      some([
        {
          address,
          index: 0,
          balance: option.getOrElse(() => Wei.zero)(balance),
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

  const loadBalance = async (transactions: readonly Transaction[]): Promise<void> => {
    const address = getCurrentAddress()
    const balance = await fetchBalance(address)
    const pendingBalance = getPendingBalance(transactions)

    setAvailableBalance(
      pipe(
        balance,
        option.map((b) => asWei(b.minus(pendingBalance))),
      ),
    )
    setTotalBalance(balance)
  }

  const load = (
    loadFns: Array<() => Promise<void>> = [() => loadBalance(transactions), loadAccounts],
  ): Promise<void> => {
    setWalletStatus('LOADING')
    setError(option.none)
    return pipe(
      loadFns,
      array.map((fn) => fn()),
      (p) => Promise.all(p),
      (p) => p.then(() => void 0),
    )
  }

  const getSyncStatus = async (): Promise<SynchronizationStatus> => {
    const currentTimestamp = new Date().valueOf()
    if (isMocked) {
      return {
        mode: 'offline',
        currentBlock: 0,
        lastNewBlockTimestamp: currentTimestamp,
      }
    }

    const previousSyncStatus = syncStatus
    const syncing = await web3.eth.isSyncing()

    if (syncing === true) {
      throw Error('Unexpected')
    }

    const currentBlock = await web3.eth.getBlockNumber()
    if (initialBlockNumber === undefined) {
      setInitialBlockNumber(currentBlock)
    }

    const lastNewBlockTimestamp =
      currentBlock === previousSyncStatus.currentBlock
        ? previousSyncStatus.lastNewBlockTimestamp
        : currentTimestamp

    if (syncing === false) {
      if (
        currentBlock === initialBlockNumber ||
        (currentBlock === previousSyncStatus.currentBlock &&
          currentTimestamp >
            previousSyncStatus.lastNewBlockTimestamp + EXPECTED_LAST_BLOCK_CHANGE_SECONDS * 1000)
      ) {
        return {
          mode: 'offline',
          currentBlock,
          lastNewBlockTimestamp,
        }
      } else {
        return {
          mode: 'synced',
          currentBlock,
          lastNewBlockTimestamp,
        }
      }
    }

    const allBlocks = syncing.highestBlock
    const syncedBlocks = syncing.currentBlock

    const syncedRatio =
      allBlocks + syncing.knownStates === 0
        ? 0
        : (syncedBlocks + syncing.pulledStates) / (allBlocks + syncing.knownStates)

    return {
      mode: 'online',
      currentBlock: syncing.currentBlock,
      highestKnownBlock: syncing.highestBlock,
      pulledStates: syncing.pulledStates,
      knownStates: syncing.knownStates,
      percentage: syncedRatio * 100,
      lastNewBlockTimestamp,
    }
  }

  const refreshSyncStatus = async (): Promise<void> => {
    if (!isMocked) {
      if (isNone(currentAddressOption)) {
        setWalletStatus('NO_WALLET')
      }
    }

    try {
      if (isSome(currentAddressOption)) {
        await load()
      }
    } catch (e) {
      handleRefreshError(e)
    }

    try {
      const newSyncStatus = await getSyncStatus()
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
      handleRefreshError(e)
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
      to: recipient.length == 0 ? undefined : ensure0x(recipient),
      from: getCurrentAddress(),
      value: toHex(amount),
      gas: gasLimit,
      gasPrice: toHex(gasPrice),
      data: pipe(
        data,
        option.fromNullable,
        option.filter((str) => str.length > 0),
        option.toUndefined,
      ),
    }

    const privateKey = getCurrentPrivateKey(password)
    const tx = await web3.eth.accounts.signTransaction(txConfig, privateKey)
    if (tx.rawTransaction === undefined) {
      throw createTErrorRenderer(['wallet', 'error', 'couldNotSignTransaction'])
    }
    await web3.eth.sendSignedTransaction(tx.rawTransaction) // ETCM-134
    txHistory.explicitChecks.next()
  }

  const getNextNonce = async (): Promise<number> =>
    pipe(
      currentAddressOption,
      option.getOrElseW(() => {
        throw createTErrorRenderer(['wallet', 'message', 'walletNeeded'])
      }),
      async (address) => await web3.eth.getTransactionCount(address, 'latest'),
    )

  const doTransfer = async (
    recipient: string,
    amount: Wei,
    fee: Wei,
    password: string,
  ): Promise<void> => {
    const nonce = await getNextNonce()

    return sendTransaction({
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
    await txHistory.clean()
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

  useRecurringTimeout(async () => {
    await refreshSyncStatus()
    rendererLog.debug(`sync status`, option.getOrElseW(() => null)(syncStatusOption))
  }, 3000)

  return {
    walletStatus,
    error,
    syncStatus,
    getOverviewProps,
    reset,
    generateAccount,
    getNextNonce,
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
    tncAccepted,
    setTncAccepted,
  }
}

export const WalletState = createContainer(useWalletState)
