import {useState} from 'react'
import Big from 'big.js'
import {createContainer} from 'unstated-next'
import {Option, some, none, getOrElse, isSome} from 'fp-ts/lib/Option'
import {TransparentAddressResult, Balance, Transaction} from '../web3'
import {WALLET_IS_OFFLINE} from '../common/errors'
import {deserializeBigNumber} from '../common/util'
import {wallet} from '../wallet'

export type WalletStatus = 'INITIAL' | 'LOADING' | 'LOADED' | 'ERROR'

interface OverviewProps {
  transactions: Transaction[]
  transparentBalance: Big
  availableBalance: Big
  pendingBalance: Big
}

interface InitialState {
  walletStatus: 'INITIAL'
  load: () => void
}

interface LoadingState {
  walletStatus: 'LOADING'
}

interface LoadedState {
  walletStatus: 'LOADED'
  isOffline: boolean
  getOverviewProps: () => OverviewProps
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
  const [isOffline, setIsOffline] = useState<boolean>(false)
  // const []

  // balance
  const [totalBalanceOption, setTotalBalance] = useState<Option<Big>>(none)
  const [availableBalanceOption, setAvailableBalance] = useState<Option<Big>>(none)
  const [transparentBalanceOption, setTransparentBalance] = useState<Option<Big>>(none)

  // transactions
  const [transactionsOption, setTransactions] = useState<Option<Transaction[]>>(none)

  const getOverviewProps = (): OverviewProps => {
    const transactions = getOrElse((): Transaction[] => [])(transactionsOption)
    const transparentBalance = getOrElse((): Big => Big(0))(transparentBalanceOption)
    const totalBalance = getOrElse((): Big => Big(0))(totalBalanceOption)
    const availableBalance = getOrElse((): Big => Big(0))(availableBalanceOption)
    const pendingBalance = totalBalance.minus(availableBalance)

    return {transactions, transparentBalance, availableBalance, pendingBalance}
  }

  const isLoaded = (): boolean =>
    isSome(totalBalanceOption) &&
    isSome(availableBalanceOption) &&
    isSome(transactionsOption) &&
    isSome(transparentBalanceOption)

  const walletStatus = walletStatus_ === 'LOADING' && isLoaded() ? 'LOADED' : walletStatus_

  const reset = (): void => {
    setWalletStatus('INITIAL')
    setTotalBalance(none)
    setAvailableBalance(none)
    setTransparentBalance(none)
    setTransactions(none)
    setIsOffline(false)
    setError(none)
  }

  const handleError = (e: Error): void => {
    console.error(e.message)
    setError(some(e.message))
    setWalletStatus('ERROR')
  }

  const error = getOrElse((): string => 'Unknown error')(errorOption)

  const loadTransparentBalance = async (): Promise<Big> => {
    // get every transparent address
    const addresses: TransparentAddressResult[] = await wallet.listTransparentAddresses(100, 0)

    // get balance for every transparent address
    const balances: Balance[] = await Promise.all(
      addresses.map(
        async (address: TransparentAddressResult): Promise<Balance> =>
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
    wallet
      .getTransactionHistory(10, 0)
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
        setIsOffline(false)
      })
      .catch((e: Error) => {
        if (e.message === WALLET_IS_OFFLINE) return setIsOffline(true)
        handleError(e)
      })
  }

  return {
    walletStatus,
    isOffline,
    error,
    getOverviewProps,
    reset,
    load,
  }
}

export const WalletState = createContainer(useWalletState)
