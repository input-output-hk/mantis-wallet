import React, {useState} from 'react'
import {WalletOverview} from './WalletOverview'
import './Wallets.scss'
import {NavLink} from 'react-router-dom'
import {ROUTES} from '../routes-config'

interface Wallet {
  id: string
  name: string
}

const Wallets = (): JSX.Element => {
  const dummyWallets = [...Array(10).keys()]
    .slice(1)
    .map((n): Wallet => ({id: `${n}`, name: `WALLET ${n}`}))
  const [wallets] = useState<Wallet[]>(dummyWallets)

  return (
    <div className="Wallets">
      <div className="list">
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
      <div className="content">
        <WalletOverview pending={3815.62} confidental={15262.46} transparent={6359.36} />
        <div className="details"></div>
      </div>
    </div>
  )
}

export default Wallets
