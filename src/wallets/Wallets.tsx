import React, {useEffect} from 'react'
import {WalletState} from '../common/wallet-state'
import {Navigate} from '../layout/Router'
import {Loading} from '../common/Loading'
import {Wallet} from './Wallet'
import {rendererLog} from '../common/logger'

export const Wallets = (): JSX.Element => {
  const walletState = WalletState.useContainer()

  useEffect(() => {
    if (walletState.walletStatus === 'INITIAL') {
      walletState.refreshSyncStatus()
    }

    rendererLog.debug(`walletStatus: ${walletState.walletStatus}`)
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
    case 'NO_WALLET': {
      return <Navigate to="WALLET_SETUP" />
    }
  }
}
