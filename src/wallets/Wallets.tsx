import React, {useState} from 'react'
import {NavLink, Redirect} from 'react-router-dom'
import {WALLET_DOES_NOT_EXIST, WALLET_IS_LOCKED} from '../common/errors'
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
const dummyWallets = [...Array(1).keys()].map(
  (n): Wallet => ({id: `${n}`, name: `WALLET ${n + 1}`}),
)

export const Wallets = (): JSX.Element => {
  const state = WalletState.useContainer()

  const [wallets] = useState<Wallet[]>(dummyWallets)

  switch (state.walletStatus) {
    case 'INITIAL': {
      state.load()
      return <Loading />
    }
    case 'LOADING': {
      return <Loading />
    }
    case 'ERROR': {
      switch (state.error) {
        case WALLET_DOES_NOT_EXIST: {
          return <Redirect to={ROUTES.WALLET_SETUP.path} />
        }
        case WALLET_IS_LOCKED: {
          return <Redirect to={ROUTES.WALLET_UNLOCK.path} />
        }
        default: {
          return <b>{state.error}</b>
        }
      }
    }
    case 'LOADED': {
      const {
        transactions,
        transparentBalance,
        availableBalance,
        pendingBalance,
        transparentAddresses,
      } = state.getOverviewProps()

      return (
        <div className="Wallets">
          <div className="list invisible-scrollbar">
            <ul className="wallet-links">
              {wallets.map((wallet) => (
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
            />
          </div>
        </div>
      )
    }
  }
}
