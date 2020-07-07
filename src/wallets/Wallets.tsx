import React, {useEffect} from 'react'
import {WalletState} from '../common/wallet-state'
import {Navigate} from '../layout/Router'
import {Loading} from '../common/Loading'
import {WalletError} from './WalletErrorScreen'
import {Wallet} from './Wallet'

export const Wallets = (): JSX.Element => {
  const walletState = WalletState.useContainer()

  useEffect(() => {
    if (walletState.walletStatus === 'INITIAL') {
      walletState.refreshSyncStatus()
    }
  }, [walletState.walletStatus])

  switch (walletState.walletStatus) {
    case 'INITIAL': {
      return <Loading />
    }
    case 'LOADING': {
      return <Loading />
    }
    case 'LOADED': {
      return <Wallet />
    }
    case 'LOCKED': {
      return <Navigate to="WALLET_UNLOCK" />
    }
    case 'NO_WALLET': {
      return <Navigate to="WALLET_SETUP" />
    }
    case 'ERROR': {
      return <WalletError />
    }
  }
}
