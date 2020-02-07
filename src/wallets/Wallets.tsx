import React, {useEffect} from 'react'
import {NavLink, Redirect} from 'react-router-dom'
import {WalletState} from '../common/wallet-state'
import {Loading} from '../common/Loading'
import {ROUTES} from '../routes-config'
import {WalletOverview} from './WalletOverview'
import {TransactionHistory} from './TransactionHistory'
import './Wallets.scss'

interface Wallet {
  id: string
  name: string
}

// FIXME: when multiple wallets can be managed
const dummyWallets: Wallet[] = [...Array(1).keys()].map(
  (n): Wallet => ({id: `${n}`, name: `WALLET ${n + 1}`}),
)

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
        <div className="Wallets">
          <div className="list invisible-scrollbar">
            <ul className="wallet-links">
              {dummyWallets.map((wallet) => (
                <li key={wallet.id}>
                  <NavLink
                    to={`${ROUTES.WALLETS.path}/${wallet.id}`}
                    className="wallet-link"
                    activeClassName="wallet-link-first"
                  >
                    {wallet.name}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
          <div className="content invisible-scrollbar">
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
        </div>
      )
    }
    case 'LOCKED': {
      return <Redirect to={ROUTES.WALLET_UNLOCK.path} />
    }
    case 'NO_WALLET': {
      return <Redirect to={ROUTES.WALLET_SETUP.path} />
    }
    case 'ERROR': {
      return <b>{state.errorMsg}</b>
    }
  }
}
