import {useState} from 'react'
import BigNumber from 'bignumber.js'
import _ from 'lodash/fp'
import * as t from 'io-ts'
import * as tPromise from 'io-ts-promise'
import {createContainer} from 'unstated-next'
import {Option, some, none, getOrElse, isSome} from 'fp-ts/lib/Option'
import {Remote} from 'comlink'
import {WALLET_IS_OFFLINE, WALLET_IS_LOCKED, WALLET_DOES_NOT_EXIST} from '../common/errors'
import {deserializeBigNumber, loadAll, bigSum} from '../common/util'
import {Chain} from '../pob/chains'
import {NumberFromHexString, BigNumberFromHexString} from './io-helpers'
import {
  makeWeb3Worker,
  TransparentAddress,
  Balance,
  Transaction,
  Account,
  SpendingKey,
  SeedPhrase,
  PassphraseSecrets,
  Web3API,
  FeeLevel,
  CallParams,
} from '../web3'

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

const TRANSFER_GAS_LIMIT = 21000

export type SynchronizationStatus = t.TypeOf<typeof SynchronizationStatus>

export type TransparentAccount = TransparentAddress & {balance: BigNumber}

export type FeeEstimates = t.TypeOf<typeof FeeEstimates>

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
  transparentAccounts: TransparentAccount[]
  getOverviewProps: () => Overview
  reset: () => void
  remove: (secrets: PassphraseSecrets) => Promise<boolean>
  generateNewAddress: () => Promise<void>
  refreshSyncStatus: () => Promise<void>
  sendTransaction: (recipient: string, amount: number, fee: number) => Promise<string>
  sendTxToTransparent: (
    recipient: string,
    amount: BigNumber,
    gasPrice: BigNumber,
  ) => Promise<string>
  redeemValue: (address: string, amount: number, fee: number) => Promise<string>
  estimatePublicTransactionFee(amount: BigNumber, recipient: string): Promise<FeeEstimates>
  estimateTransactionFee(amount: BigNumber): Promise<FeeEstimates>
  estimateRedeemFee(amount: BigNumber): Promise<FeeEstimates>
  estimateGasPrice(): Promise<FeeEstimates>
  getBurnAddress: (
    address: string,
    chain: Chain,
    reward: number,
    autoConversion: boolean,
  ) => Promise<string>
}

export interface LockedState {
  walletStatus: 'LOCKED'
  reset: () => void
  remove: (secrets: PassphraseSecrets) => Promise<boolean>
  unlock: (secrets: PassphraseSecrets) => Promise<boolean>
}

export interface NoWalletState {
  walletStatus: 'NO_WALLET'
  reset: () => void
  create: (secrets: PassphraseSecrets) => Promise<SpendingKey & SeedPhrase>
  restoreFromSeedPhrase: (secrets: SeedPhrase & PassphraseSecrets) => Promise<boolean>
  restoreFromSpendingKey: (secrets: SpendingKey & PassphraseSecrets) => Promise<boolean>
}

export interface ErrorState {
  walletStatus: 'ERROR'
  errorMsg: string
  reset: () => void
  remove: (secrets: PassphraseSecrets) => Promise<boolean>
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
  transactions: Transaction[]
  transparentBalance: BigNumber
  availableBalance: BigNumber
  pendingBalance: BigNumber
  transparentAccounts: TransparentAccount[]
  accounts: Account[]
}

interface WalletStateParams {
  walletStatus: WalletStatus
  web3: Remote<Web3API>
  errorMsg: Option<string>
  syncStatus: Option<SynchronizationStatus>
  totalBalance: Option<BigNumber>
  availableBalance: Option<BigNumber>
  transparentBalance: Option<BigNumber>
  transactions: Option<Transaction[]>
  transparentAccounts: Option<TransparentAccount[]>
  accounts: Option<Account[]>
}

const DEFAULT_STATE: WalletStateParams = {
  walletStatus: 'INITIAL',
  web3: makeWeb3Worker(),
  errorMsg: none,
  syncStatus: none,
  totalBalance: none,
  availableBalance: none,
  transparentBalance: none,
  transactions: none,
  transparentAccounts: none,
  accounts: none,
}

export const canRemoveWallet = (
  walletState: WalletData,
): walletState is LoadedState | LockedState | ErrorState =>
  walletState.walletStatus === 'LOADED' ||
  walletState.walletStatus === 'LOCKED' ||
  walletState.walletStatus === 'ERROR'

const getPublicTransactionParams = (
  amount: BigNumber,
  gasPrice: BigNumber,
  to?: string,
): CallParams => ({
  from: 'Wallet',
  to,
  value: amount.toString(16),
  gasPrice: gasPrice.toString(16),
  gasLimit: TRANSFER_GAS_LIMIT.toString(16),
})

function useWalletState(initialState?: Partial<WalletStateParams>): WalletData {
  const _initialState = _.merge(DEFAULT_STATE)(initialState)
  const wallet = _initialState.web3.midnight.wallet
  const eth = _initialState.web3.eth

  // wallet status
  const [walletStatus_, setWalletStatus] = useState<WalletStatus>(_initialState.walletStatus)
  const [errorMsgOption, setErrorMsg] = useState<Option<string>>(_initialState.errorMsg)
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
  const [transparentBalanceOption, setTransparentBalance] = useState<Option<BigNumber>>(
    _initialState.transparentBalance,
  )

  // transactions
  const [transactionsOption, setTransactions] = useState<Option<Transaction[]>>(
    _initialState.transactions,
  )

  // addresses / accounts
  const [accountsOption, setAccounts] = useState<Option<Account[]>>(_initialState.accounts)
  const [transparentAccountsOption, setTransparentAccounts] = useState<
    Option<TransparentAccount[]>
  >(_initialState.transparentAccounts)

  const transparentAccounts = getOrElse((): TransparentAccount[] => [])(transparentAccountsOption)

  const getOverviewProps = (): Overview => {
    const transactions = getOrElse((): Transaction[] => [])(transactionsOption)
    const transparentBalance = getOrElse((): BigNumber => new BigNumber(0))(
      transparentBalanceOption,
    )
    const totalBalance = getOrElse((): BigNumber => new BigNumber(0))(totalBalanceOption)
    const availableBalance = getOrElse((): BigNumber => new BigNumber(0))(availableBalanceOption)
    const pendingBalance = totalBalance.minus(availableBalance)

    const accounts = getOrElse((): Account[] => [])(accountsOption)

    return {
      transactions,
      transparentBalance,
      availableBalance,
      pendingBalance,
      transparentAccounts,
      accounts,
    }
  }

  const isLoaded = (): boolean =>
    isSome(totalBalanceOption) &&
    isSome(availableBalanceOption) &&
    isSome(transactionsOption) &&
    isSome(transparentBalanceOption) &&
    isSome(transparentAccountsOption) &&
    isSome(accountsOption) &&
    isSome(syncStatusOption)

  const walletStatus = walletStatus_ === 'LOADING' && isLoaded() ? 'LOADED' : walletStatus_

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
    setTransparentBalance(none)
    setTransactions(none)
    setErrorMsg(none)
    setTransparentAccounts(none)
    setAccounts(none)
    setSyncStatus(none)
  }

  const handleError = (e: Error): void => {
    if (e.message === WALLET_IS_LOCKED) {
      setWalletStatus('LOCKED')
    } else if (e.message === WALLET_DOES_NOT_EXIST) {
      setWalletStatus('NO_WALLET')
    } else {
      console.error(e)
      setErrorMsg(some(e.message))
      setWalletStatus('ERROR')
    }
  }

  const errorMsg = getOrElse((): string => 'Unknown error')(errorMsgOption)

  const loadTransparentAccounts = async (): Promise<TransparentAccount[]> => {
    const transparentAddresses: TransparentAddress[] = await loadAll(
      wallet.listTransparentAddresses,
    )

    return Promise.all(
      // eslint-disable-next-line
      _.reverse(transparentAddresses).map(
        async (address: TransparentAddress): Promise<TransparentAccount> => {
          const balance = await wallet.getTransparentWalletBalance(address.address)
          return {
            balance: new BigNumber(balance),
            ...address,
          }
        },
      ),
    )
  }

  const load = (): void => {
    // set loading status
    setWalletStatus('LOADING')

    // load transaction history
    loadAll<Transaction>(wallet.getTransactionHistory)
      .then((transactions: Transaction[]) => setTransactions(some(transactions)))
      .catch(handleError)

    // load balance
    wallet
      .getBalance()
      .then((balance: Balance) => {
        setTotalBalance(some(deserializeBigNumber(balance.totalBalance)))
        setAvailableBalance(some(deserializeBigNumber(balance.availableBalance)))
      })
      .catch(handleError)

    // load transparent accounts and total transparent balance
    loadTransparentAccounts()
      .then((transparentAccounts) => {
        setTransparentAccounts(some(transparentAccounts))
        setTransparentBalance(some(bigSum(transparentAccounts.map(({balance}) => balance))))
      })
      .catch((e: Error) => {
        if (e.message === WALLET_IS_OFFLINE) {
          setTransparentBalance(some(new BigNumber(0)))
          setTransparentAccounts(some([]))
          return
        }
        handleError(e)
      })

    wallet
      .listAccounts()
      .then((accounts: Account[]) => setAccounts(some(accounts)))
      .catch(handleError)
  }

  const refreshSyncStatus = async (): Promise<void> => {
    try {
      const result = await wallet.getSynchronizationStatus()
      if (typeof result === 'string') throw Error(result)
      const newSyncStatus = await tPromise.decode(SynchronizationStatus, result)
      if (newSyncStatus.currentBlock !== syncStatus.currentBlock) load()
      if (!_.isEqual(newSyncStatus)(syncStatus)) setSyncStatus(some(newSyncStatus))
    } catch (e) {
      handleError(e)
    }
  }

  const generateNewAddress = async (): Promise<void> => {
    await wallet.generateTransparentAddress()

    const transparentAccounts = await loadTransparentAccounts()

    setTransparentAccounts(some(transparentAccounts))
  }

  const sendTransaction = async (
    recipient: string,
    amount: number,
    fee: number,
  ): Promise<string> => {
    const result = await wallet.sendTransaction(recipient, amount, fee)
    load()
    return result
  }

  const sendTxToTransparent = async (
    recipient: string,
    amount: BigNumber,
    gasPrice: BigNumber,
  ): Promise<string> => {
    const result = await wallet.callContract(
      getPublicTransactionParams(amount, gasPrice, recipient),
    )
    load()
    return result
  }

  const redeemValue = async (address: string, amount: number, fee: number): Promise<string> => {
    const result = await wallet.redeemValue(address, amount, fee)
    load()
    return result
  }

  const restoreFromSpendingKey = async (
    secrets: SpendingKey & PassphraseSecrets,
  ): Promise<boolean> => {
    return wallet.restoreFromSpendingKey(secrets)
  }

  const restoreFromSeedPhrase = async (
    secrets: SeedPhrase & PassphraseSecrets,
  ): Promise<boolean> => {
    return wallet.restoreFromSeedPhrase(secrets)
  }

  const create = async (secrets: PassphraseSecrets): Promise<SpendingKey & SeedPhrase> => {
    const result = await wallet.create(secrets)
    load()
    return result
  }

  const unlock = async (secrets: PassphraseSecrets): Promise<boolean> => {
    const response = await wallet.unlock(secrets)
    if (response) reset()
    return response
  }

  const remove = async (secrets: PassphraseSecrets): Promise<boolean> => {
    const removed = await wallet.remove(secrets)
    if (removed) {
      reset()
      setWalletStatus('NO_WALLET')
    }
    return removed
  }

  const getBurnAddress = async (
    address: string,
    chain: Chain,
    reward: number,
    autoConversion: boolean,
  ): Promise<string> => wallet.getBurnAddress(address, chain.numericId, reward, autoConversion)

  const estimateGasPrice = (): Promise<FeeEstimates> =>
    eth
      .getGasPriceEstimation()
      .then((res) => _.mapValues<number, BigNumber>((v) => new BigNumber(v))(res) as FeeEstimates)

  const estimateFees = (
    txType: 'RedeemTx' | 'TransferTx',
    amount: BigNumber,
  ): Promise<FeeEstimates> =>
    wallet.estimateFees(txType, amount.toNumber()).then((res) => tPromise.decode(FeeEstimates, res))

  const estimateRedeemFee = (amount: BigNumber): Promise<FeeEstimates> =>
    estimateFees('RedeemTx', amount)

  const estimateTransactionFee = (amount: BigNumber): Promise<FeeEstimates> =>
    estimateFees('TransferTx', amount)

  const estimatePublicTransactionFee = (
    amount: BigNumber,
    recipient: string,
  ): Promise<FeeEstimates> =>
    wallet
      .estimateFees(
        'CallTx',
        getPublicTransactionParams(amount, new BigNumber(0), recipient ? recipient : undefined),
      )
      .then((res) => tPromise.decode(FeeEstimates, res))

  return {
    walletStatus,
    errorMsg,
    syncStatus,
    getOverviewProps,
    reset,
    generateNewAddress,
    refreshSyncStatus,
    sendTransaction,
    sendTxToTransparent,
    estimatePublicTransactionFee,
    estimateTransactionFee,
    estimateRedeemFee,
    estimateGasPrice,
    redeemValue,
    create,
    unlock,
    restoreFromSpendingKey,
    restoreFromSeedPhrase,
    remove,
    getBurnAddress,
    transparentAccounts,
  }
}

export const WalletState = createContainer(useWalletState)
