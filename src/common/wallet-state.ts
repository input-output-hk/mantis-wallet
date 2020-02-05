import {useState} from 'react'
import Big from 'big.js'
import _ from 'lodash'
import {createContainer} from 'unstated-next'
import {Option, some, none, getOrElse, isSome} from 'fp-ts/lib/Option'
import {TransparentAddress, Balance, Transaction, Account, SynchronizationStatus} from '../web3'
import {WALLET_IS_OFFLINE} from '../common/errors'
import {deserializeBigNumber, loadAll} from '../common/util'
import {web3} from '../web3'

const wallet = web3.midnight.wallet

export type WalletStatus = 'INITIAL' | 'LOADING' | 'LOADED' | 'ERROR'

interface Overview {
  transactions: Transaction[]
  transparentBalance: Big
  availableBalance: Big
  pendingBalance: Big
  transparentAddresses: TransparentAddress[]
  accounts: Account[]
}

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
  generateNewAddress: () => Promise<void>
  refreshSyncStatus: () => Promise<void>
  reset: () => void
}

interface ErrorState {
  walletStatus: 'ERROR'
  error: string
  reset: () => void
}

type WalletState = InitialState | LoadingState | LoadedState | ErrorState

function useWalletState(initialWalletStatus: WalletStatus = 'INITIAL'): WalletState {
  // wallet status
  const [walletStatus_, setWalletStatus] = useState<WalletStatus>(initialWalletStatus)
  const [errorOption, setError] = useState<Option<string>>(none)
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

  const error = getOrElse((): string => 'Unknown error')(errorOption)

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
    setError(none)
    setTransparentAddresses(none)
    setAccounts(none)
    setSyncStatus(none)
  }

  const handleError = (e: Error): void => {
    console.error(e.message)
    setError(some(e.message))
    setWalletStatus('ERROR')
  }

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
      const response = await web3.midnight.wallet.getSynchronizationStatus()
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

  return {
    walletStatus,
    error,
    syncStatus,
    getOverviewProps,
    reset,
    generateNewAddress,
    refreshSyncStatus,
  }
}

export const WalletState = createContainer(useWalletState)
