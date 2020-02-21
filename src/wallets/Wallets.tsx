import React, {useEffect} from 'react'
import {WalletState} from '../common/wallet-state'
import {Navigate} from '../layout/Router'
import {Loading} from '../common/Loading'
import {WalletOverview} from './WalletOverview'
import {TransactionHistory} from './TransactionHistory'
import './Wallets.scss'

export const Wallets = (): JSX.Element => {
  const state = WalletState.useContainer()

  useEffect(() => {
    if (state.walletStatus === 'INITIAL') {
      state.refreshSyncStatus()
    }
  }, [state.walletStatus])

  switch (state.walletStatus) {
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
      } = state.getOverviewProps()

      return (
        <div className="Wallets invisible-scrollbar" id="wallets">
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
      return <b>{state.errorMsg}</b>
    }
  }
}
