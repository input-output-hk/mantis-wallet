import {useState} from 'react'
import Big from 'big.js'
import _ from 'lodash'
import {createContainer} from 'unstated-next'
import {Option, some, none, getOrElse, isSome} from 'fp-ts/lib/Option'
import {WALLET_IS_OFFLINE, WALLET_IS_LOCKED, WALLET_DOES_NOT_EXIST} from '../common/errors'
import {deserializeBigNumber, loadAll} from '../common/util'
import {
  web3,
  TransparentAddress,
  Balance,
  Transaction,
  Account,
  SpendingKey,
  SeedPhrase,
  PassphraseSecrets,
  SynchronizationStatus,
} from '../web3'

const wallet = web3.midnight.wallet

interface InitialState {
  walletStatus: 'INITIAL'
  refreshSyncStatus: () => Promise<void>
}

interface LoadingState {
  walletStatus: 'LOADING'
}

interface LoadedState {
  walletStatus: 'LOADED'
  syncStatus: SynchronizationStatus
  getOverviewProps: () => Overview
  reset: () => void
  generateNewAddress: () => Promise<void>
  refreshSyncStatus: () => Promise<void>
  sendTransaction: (recipient: string, amount: number, fee: number) => Promise<string>
}

interface LockedState {
  walletStatus: 'LOCKED'
  reset: () => void
  unlock: (secrets: PassphraseSecrets) => Promise<boolean>
}

interface NoWalletState {
  walletStatus: 'NO_WALLET'
  reset: () => void
  create: (secrets: PassphraseSecrets) => Promise<SpendingKey & SeedPhrase>
  restoreFromSeedPhrase: (secrets: SeedPhrase & PassphraseSecrets) => Promise<boolean>
  restoreFromSpendingKey: (secrets: SpendingKey & PassphraseSecrets) => Promise<boolean>
}

interface ErrorState {
  walletStatus: 'ERROR'
  errorMsg: string
  reset: () => void
}

export type WalletStatus = 'INITIAL' | 'LOADING' | 'LOADED' | 'LOCKED' | 'NO_WALLET' | 'ERROR'
type WalletState =
  | InitialState
  | LoadingState
  | LoadedState
  | LockedState
  | NoWalletState
  | ErrorState

interface Overview {
  transactions: Transaction[]
  transparentBalance: Big
  availableBalance: Big
  pendingBalance: Big
  transparentAddresses: TransparentAddress[]
  accounts: Account[]
}

function useWalletState(initialWalletStatus: WalletStatus = 'INITIAL'): WalletState {
  // wallet status
  const [walletStatus_, setWalletStatus] = useState<WalletStatus>(initialWalletStatus)
  const [errorMsgOption, setErrorMsg] = useState<Option<string>>(none)
  const [syncStatusOption, setSyncStatus] = useState<Option<SynchronizationStatus>>(none)

  // balance
  const [totalBalanceOption, setTotalBalance] = useState<Option<Big>>(none)
  const [availableBalanceOption, setAvailableBalance] = useState<Option<Big>>(none)
  const [transparentBalanceOption, setTransparentBalance] = useState<Option<Big>>(none)

  // transactions
  const [transactionsOption, setTransactions] = useState<Option<Transaction[]>>(none)

  // addresses
  const [transparentAddressesOption, setTransparentAddresses] = useState<
    Option<TransparentAddress[]>
  >(none)
  const [accountsOption, setAccounts] = useState<Option<Account[]>>(none)

  const getOverviewProps = (): Overview => {
    const transactions = getOrElse((): Transaction[] => [])(transactionsOption)
    const transparentBalance = getOrElse((): Big => Big(0))(transparentBalanceOption)
    const totalBalance = getOrElse((): Big => Big(0))(totalBalanceOption)
    const availableBalance = getOrElse((): Big => Big(0))(availableBalanceOption)
    const pendingBalance = totalBalance.minus(availableBalance)

    const transparentAddresses = getOrElse((): TransparentAddress[] => [])(
      transparentAddressesOption,
    )
    const accounts = getOrElse((): Account[] => [])(accountsOption)

    return {
      transactions,
      transparentBalance,
      availableBalance,
      pendingBalance,
      transparentAddresses,
      accounts,
    }
  }

  const isLoaded = (): boolean =>
    isSome(totalBalanceOption) &&
    isSome(availableBalanceOption) &&
    isSome(transactionsOption) &&
    isSome(transparentBalanceOption) &&
    isSome(transparentAddressesOption) &&
    isSome(accountsOption) &&
    isSome(syncStatusOption)

  const walletStatus = walletStatus_ === 'LOADING' && isLoaded() ? 'LOADED' : walletStatus_

  const syncStatus = getOrElse(
    (): SynchronizationStatus => ({
      mode: 'offline',
      currentBlock: '-1',
    }),
  )(syncStatusOption)

  const reset = (): void => {
    setWalletStatus('INITIAL')
    setTotalBalance(none)
    setAvailableBalance(none)
    setTransparentBalance(none)
    setTransactions(none)
    setErrorMsg(none)
    setTransparentAddresses(none)
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

  const loadTransparentBalance = async (): Promise<Big> => {
    // get every transparent address
    const transparentAddresses: TransparentAddress[] = await loadAll(
      wallet.listTransparentAddresses,
    )

    setTransparentAddresses(some(transparentAddresses))

    // get balance for every transparent address
    const balances: Balance[] = await Promise.all(
      transparentAddresses.map(
        async (address: TransparentAddress): Promise<Balance> =>
          wallet.getTransparentWalletBalance(address.address),
      ),
    )
    return balances
      .map((balance) => deserializeBigNumber(balance.availableBalance))
      .reduce((prev: Big, current: Big) => prev.plus(current), Big(0))
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

    // load transparent balances
    loadTransparentBalance()
      .then((availableTransparentBalance) => {
        setTransparentBalance(some(availableTransparentBalance))
      })
      .catch((e: Error) => {
        if (e.message === WALLET_IS_OFFLINE) return
        handleError(e)
      })

    wallet
      .listAccounts()
      .then((accounts: Account[]) => setAccounts(some(accounts)))
      .catch(handleError)
  }

  const refreshSyncStatus = async (): Promise<void> => {
    try {
      const response = await wallet.getSynchronizationStatus()
      if (response.currentBlock !== syncStatus.currentBlock) load()
      if (!_.isEqual(response, syncStatus)) setSyncStatus(some(response))
    } catch (e) {
      handleError(e)
    }
  }

  const generateNewAddress = async (): Promise<void> => {
    await wallet.generateTransparentAddress()

    const transparentAddresses: TransparentAddress[] = await loadAll(
      wallet.listTransparentAddresses,
    )

    setTransparentAddresses(some(transparentAddresses))
  }

  const sendTransaction = async (
    recipient: string,
    amount: number,
    fee: number,
  ): Promise<string> => {
    return wallet.sendTransaction(recipient, amount, fee)
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
    return wallet.create(secrets)
  }

  const unlock = async (secrets: PassphraseSecrets): Promise<boolean> => {
    const response = await wallet.unlock(secrets)
    if (response) reset()
    return response
  }

  return {
    walletStatus,
    errorMsg,
    syncStatus,
    getOverviewProps,
    reset,
    generateNewAddress,
    refreshSyncStatus,
    sendTransaction,
    create,
    unlock,
    restoreFromSpendingKey,
    restoreFromSeedPhrase,
  }
}

export const WalletState = createContainer(useWalletState)
