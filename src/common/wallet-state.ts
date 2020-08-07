import {useState} from 'react'
import BigNumber from 'bignumber.js'
import _ from 'lodash/fp'
import * as t from 'io-ts'
import * as tPromise from 'io-ts-promise'
import {createContainer} from 'unstated-next'
import {Option, some, none, getOrElse, isSome} from 'fp-ts/lib/Option'
import {Remote} from 'comlink'
import {WALLET_IS_OFFLINE, WALLET_IS_LOCKED, WALLET_DOES_NOT_EXIST} from './errors'
import {
  deserializeBigNumber,
  loadAll,
  bigSum,
  toHex,
  bech32toHex,
  returnDataToHumanReadable,
} from './util'
import {Chain, ChainId} from '../pob/chains'
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
import {BuildJobState} from './build-job-state'
import {CHAINS_TO_USE_IN_POB} from '../pob/pob-config'
import {rendererLog} from './logger'

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

export type TransparentAccount = TransparentAddress & {
  balance: BigNumber
  midnightTokens: Partial<Record<ChainId, BigNumber>>
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
  transparentAccounts: TransparentAccount[]
  getOverviewProps: () => Overview
  callTxStatuses: CallTxStatuses
  reset: () => void
  remove: (secrets: PassphraseSecrets) => Promise<boolean>
  getSpendingKey: (secrets: PassphraseSecrets) => Promise<string>
  lock: (secrets: PassphraseSecrets) => Promise<boolean>
  generateNewAddress: () => Promise<void>
  refreshSyncStatus: () => Promise<void>
  sendTransaction: (recipient: string, amount: number, fee: number) => Promise<string>
  sendTxToTransparent: (
    recipient: string,
    amount: BigNumber,
    gasPrice: BigNumber,
  ) => Promise<string>
  redeemValue: (address: string, amount: number, fee: number) => Promise<string>
  calculateGasPrice: (fee: number, callParams: CallParams) => Promise<number>
  estimatePublicTransactionFee(amount: BigNumber, recipient: string): Promise<FeeEstimates>
  estimateCallFee(callParams: CallParams): Promise<FeeEstimates>
  estimateTransactionFee(amount: BigNumber): Promise<FeeEstimates>
  estimateRedeemFee(amount: BigNumber): Promise<FeeEstimates>
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
  error: Error
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
  transparentBalance: BigNumber
  availableBalance: BigNumber
  pendingBalance: BigNumber
  transparentAccounts: TransparentAccount[]
  accounts: Account[]
  transactions: Transaction[]
}

interface WalletStateParams {
  walletStatus: WalletStatus
  web3: Remote<Web3API>
  error: Option<Error>
  syncStatus: Option<SynchronizationStatus>
  totalBalance: Option<BigNumber>
  availableBalance: Option<BigNumber>
  transparentBalance: Option<BigNumber>
  transparentAccounts: Option<TransparentAccount[]>
  accounts: Option<Account[]>
  transactions: Option<Transaction[]>
  callTxStatuses: CallTxStatuses
}

const DEFAULT_STATE: WalletStateParams = {
  walletStatus: 'INITIAL',
  web3: makeWeb3Worker(),
  error: none,
  syncStatus: none,
  totalBalance: none,
  availableBalance: none,
  transparentBalance: none,
  transparentAccounts: none,
  accounts: none,
  transactions: none,
  callTxStatuses: {},
}

export const canRemoveWallet = (
  walletState: WalletData,
): walletState is LoadedState | LockedState | ErrorState =>
  walletState.walletStatus === 'LOADED' ||
  walletState.walletStatus === 'LOCKED' ||
  walletState.walletStatus === 'ERROR'

const getPublicTransactionParams = (
  amount: BigNumber,
  gasPrice: BigNumber | number,
  to?: string,
): CallParams => ({
  from: 'Wallet',
  to,
  value: toHex(amount),
  gasPrice: gasPrice.toString(10),
  gasLimit: toHex(TRANSFER_GAS_LIMIT),
})

function useWalletState(initialState?: Partial<WalletStateParams>): WalletData {
  const _initialState = _.merge(DEFAULT_STATE)(initialState)
  const wallet = _initialState.web3.midnight.wallet
  const {erc20, eth} = _initialState.web3

  const buildJobState = BuildJobState.useContainer()

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
  const [transparentBalanceOption, setTransparentBalance] = useState<Option<BigNumber>>(
    _initialState.transparentBalance,
  )

  // transactions
  const [transactionsOption, setTransactions] = useState<Option<Transaction[]>>(
    _initialState.transactions,
  )
  const [callTxStatuses, setCallTxStatuses] = useState<CallTxStatuses>(_initialState.callTxStatuses)

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
      transparentBalance,
      availableBalance,
      pendingBalance,
      transparentAccounts,
      accounts,
      transactions,
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
    setError(none)
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
      rendererLog.error(e)
      setError(some(e))
      setWalletStatus('ERROR')
    }
  }

  const error = getOrElse((): Error => Error('Unknown error'))(errorOption)

  const loadTransparentAccounts = async (): Promise<void> => {
    const transparentAddresses: TransparentAddress[] = await loadAll(
      wallet.listTransparentAddresses,
    )

    const getLastKnownBalance = (index: number): BigNumber =>
      transparentAccounts[transparentAccounts.length - 1 - index]?.balance || new BigNumber(0)

    return Promise.all(
      // eslint-disable-next-line
      _.reverse(transparentAddresses).map(
        async (address: TransparentAddress): Promise<TransparentAccount> => {
          const balance = await wallet
            .getTransparentWalletBalance(address.address)
            .catch((e) =>
              e.message === WALLET_IS_OFFLINE
                ? getLastKnownBalance(address.index)
                : Promise.reject(e),
            )
          const midnightTokens = await Promise.all(
            CHAINS_TO_USE_IN_POB.map(({id}) =>
              erc20[id]
                .balanceOf(bech32toHex(address.address))
                .then((balance) => [id, deserializeBigNumber(balance)])
                .catch((err) => {
                  rendererLog.error(err)
                  return [id, new BigNumber(0)]
                }),
            ),
          )
          return {
            balance: new BigNumber(balance),
            midnightTokens: _.fromPairs(midnightTokens),
            ...address,
          }
        },
      ),
    ).then((transparentAccounts) => {
      setTransparentAccounts(some(transparentAccounts))
      setTransparentBalance(some(bigSum(transparentAccounts.map(({balance}) => balance))))
    })
  }

  const loadBalance = (): Promise<void> =>
    wallet.getBalance().then((balance: Balance) => {
      setTotalBalance(some(deserializeBigNumber(balance.totalBalance)))
      setAvailableBalance(some(deserializeBigNumber(balance.availableBalance)))
    })

  const _getCallTransactionStatus = async (transactionHash: string): Promise<TransactionStatus> => {
    // (private) Get status of contract call transaction

    const rawTx = await eth.getTransaction(transactionHash)
    if (rawTx === null) {
      // null if not found or failed
      return {
        status: 'TransactionFailed',
        message: 'Transaction failed before reaching the contract. Try again with a higher fee.',
      }
    }

    const receipt = await eth.getTransactionReceipt(transactionHash)
    return receipt === null
      ? {status: 'TransactionPending'}
      : {
          status: parseInt(receipt.statusCode, 16) === 1 ? 'TransactionOk' : 'TransactionFailed',
          message: receipt.returnData ? returnDataToHumanReadable(receipt.returnData) : '',
        }
  }

  const _updateCallTxStatuses = async (transactions: Transaction[]): Promise<void> => {
    const hashesToCheck = transactions
      .filter((tx) => tx.txDetails.txType === 'call')
      .map((tx) => tx.hash)

    const newStatuses = await Promise.all(
      hashesToCheck.map(async (txHash) => {
        const newStatus = await _getCallTransactionStatus(txHash)
        return [txHash, newStatus]
      }),
    )

    setCallTxStatuses(_.fromPairs(newStatuses))
  }

  const loadTransactionHistory = (): Promise<void> =>
    loadAll<Transaction>(wallet.getTransactionHistory).then((transactions: Transaction[]) => {
      setTransactions(some(transactions))
      _updateCallTxStatuses(transactions)
    })

  const loadAccounts = (): Promise<void> =>
    wallet.listAccounts().then((accounts: Account[]) => setAccounts(some(accounts)))

  const load = (
    loadFns: Array<() => Promise<void>> = [
      loadTransactionHistory,
      loadBalance,
      loadTransparentAccounts,
      loadAccounts,
    ],
  ): void => {
    setWalletStatus('LOADING')

    loadFns.forEach((fn) => fn().catch(handleError))
  }

  const refreshSyncStatus = async (): Promise<void> => {
    try {
      const result = await wallet.getSynchronizationStatus()
      if (typeof result === 'string') throw Error(result)
      const newSyncStatus = await tPromise.decode(SynchronizationStatus, result)
      if (newSyncStatus.currentBlock !== syncStatus.currentBlock) {
        load()
      }
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

  const generateNewAddress = async (): Promise<void> => {
    await wallet.generateTransparentAddress()
    await loadTransparentAccounts()
  }

  const sendTransaction = async (
    recipient: string,
    amount: number,
    fee: number,
  ): Promise<string> => {
    const {jobHash} = await wallet.sendTransaction(recipient, amount, fee, false)
    await buildJobState.submitJob(jobHash, () => load())
    load([loadBalance])
    return jobHash
  }

  const redeemValue = async (address: string, amount: number, fee: number): Promise<string> => {
    const {jobHash} = await wallet.redeemValue(address, amount, fee, null, false)
    await buildJobState.submitJob(jobHash, () => load())
    load([loadBalance, loadTransparentAccounts])
    return jobHash
  }

  const calculateGasPrice = (fee: number, callParams: CallParams): Promise<number> =>
    wallet.calculateGasPrice('call', fee, callParams)

  const sendTxToTransparent = async (
    recipient: string,
    amount: BigNumber,
    fee: BigNumber,
  ): Promise<string> => {
    const gasPrice = await calculateGasPrice(
      fee.toNumber(),
      getPublicTransactionParams(amount, 0, recipient),
    )
    const {jobHash} = await wallet.callContract(
      getPublicTransactionParams(amount, gasPrice, recipient),
      false,
    )
    await buildJobState.submitJob(jobHash, () => load())
    load([loadBalance])
    return jobHash
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

  const lock = async (secrets: PassphraseSecrets): Promise<boolean> => {
    const response = await wallet.lock(secrets)
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

  const getSpendingKey = async (secrets: PassphraseSecrets): Promise<string> => {
    const {spendingKey} = await wallet.getSpendingKey(secrets)
    return spendingKey
  }

  const getBurnAddress = async (
    address: string,
    chain: Chain,
    reward: number,
    autoConversion: boolean,
  ): Promise<string> => wallet.getBurnAddress(address, chain.numericId, reward, autoConversion)

  const estimateFees = (txType: 'redeem' | 'transfer', amount: BigNumber): Promise<FeeEstimates> =>
    wallet.estimateFees(txType, amount.toNumber()).then((res) => tPromise.decode(FeeEstimates, res))

  const estimateRedeemFee = (amount: BigNumber): Promise<FeeEstimates> =>
    estimateFees('redeem', amount)

  const estimateTransactionFee = (amount: BigNumber): Promise<FeeEstimates> =>
    estimateFees('transfer', amount)

  const estimatePublicTransactionFee = (
    amount: BigNumber,
    recipient: string,
  ): Promise<FeeEstimates> =>
    wallet
      .estimateFees(
        'call',
        getPublicTransactionParams(amount, new BigNumber(0), recipient ? recipient : undefined),
      )
      .then((res) => tPromise.decode(FeeEstimates, res))

  const estimateCallFee = (callParams: CallParams): Promise<FeeEstimates> =>
    wallet.estimateFees('call', callParams).then((res) => tPromise.decode(FeeEstimates, res))

  return {
    walletStatus,
    error,
    syncStatus,
    getOverviewProps,
    reset,
    generateNewAddress,
    refreshSyncStatus,
    sendTransaction,
    sendTxToTransparent,
    calculateGasPrice,
    estimatePublicTransactionFee,
    estimateCallFee,
    estimateTransactionFee,
    estimateRedeemFee,
    redeemValue,
    create,
    unlock,
    lock,
    restoreFromSpendingKey,
    restoreFromSeedPhrase,
    remove,
    getSpendingKey,
    getBurnAddress,
    transparentAccounts,
    callTxStatuses,
  }
}

export const WalletState = createContainer(useWalletState)
