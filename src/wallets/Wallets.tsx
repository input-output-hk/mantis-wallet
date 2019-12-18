import React, {useState} from 'react'
import {WalletOverview} from './WalletOverview'
import './Wallets.scss'
import {NavLink} from 'react-router-dom'
import {ROUTES} from '../routes-config'
import {TransactionHistory} from './TransactionHistory'

interface Wallet {
  id: string
  name: string
}

export interface Transaction {
  id: number
  type: 'private' | 'public'
  amount: number
  time: Date
  status: 'Confirmed' | 'Pending'
}

const Wallets = (): JSX.Element => {
  const dummyWallets = [...Array(2).keys()]
    .slice(1)
    .map((n): Wallet => ({id: `${n}`, name: `WALLET ${n}`}))
  const [wallets] = useState<Wallet[]>(dummyWallets)

  const dummyTransactions = [...Array(10).keys()].slice(1).map(
    (n): Transaction => ({
      id: n,
      type: Math.random() < 0.5 ? 'private' : 'public',
      amount: Math.random() * 1000,
      time: new Date(),
      status: Math.random() < 0.5 ? 'Confirmed' : 'Pending',
    }),
  )

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
        <WalletOverview pending={3815.62} confidental={15262.46} transparent={6359.36} />
        <TransactionHistory transactions={dummyTransactions} />
      </div>
    </div>
  )
}

export default Wallets
