import React from 'react'
import {NavLink} from 'react-router-dom'
import {ROUTES} from '../routes-config'
import './WalletListSidebar.scss'

interface Wallet {
  id: string
  name: string
}

interface WalletListSidebarProps {
  wallets: Wallet[]
}

export const WalletListSidebar: React.FunctionComponent<WalletListSidebarProps> = ({
  wallets,
}: WalletListSidebarProps) => (
  <div className="WalletListSidebar invisible-scrollbar">
    <ul className="wallet-links">
      {wallets.map((wallet) => (
        <li key={wallet.id}>
          <NavLink
            to={`${ROUTES.WALLETS.path}/${wallet.id}`}
            className="wallet-link"
            activeClassName="wallet-link-active"
          >
            {wallet.name}
          </NavLink>
        </li>
      ))}
    </ul>
  </div>
)
