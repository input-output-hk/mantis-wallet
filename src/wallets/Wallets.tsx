import React, {useEffect} from 'react'
import {WalletState} from '../common/wallet-state'
import {Navigate} from '../layout/Router'
import {Loading} from '../common/Loading'
import {WalletOverview} from './WalletOverview'
import {TransactionHistory} from './TransactionHistory'
import './Wallets.scss'

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
      const {
        transactions,
        transparentBalance,
        availableBalance,
        pendingBalance,
        transparentAddresses,
        accounts,
      } = walletState.getOverviewProps()

      return (
        <div className="Wallets invisible-scrollbar">
          <WalletOverview
            pending={pendingBalance}
            confidential={availableBalance}
            transparent={transparentBalance}
          />
          <TransactionHistory
            transactions={transactions}
            transparentAddresses={transparentAddresses}
            accounts={accounts}
          />
        </div>
      )
    }
    case 'LOCKED': {
      return <Navigate to="WALLET_UNLOCK" />
    }
    case 'NO_WALLET': {
      return <Navigate to="WALLET_SETUP" />
    }
    case 'ERROR': {
      return <b>{walletState.errorMsg}</b>
    }
  }
}
