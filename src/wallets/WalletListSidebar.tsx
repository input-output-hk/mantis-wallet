import React, {FunctionComponent} from 'react'
import classnames from 'classnames'
import {fillActionHandlers} from '../common/util'
import './WalletListSidebar.scss'

interface Wallet {
  id: string
  name: string
}

interface WalletListSidebarProps {
  wallets: Wallet[]
  currentWalletId: string
  changeWallet(walletId: string): void
}

export const WalletListSidebar: FunctionComponent<WalletListSidebarProps> = ({
  wallets,
  currentWalletId,
  changeWallet,
}: WalletListSidebarProps) => {
  return (
    <div className="WalletListSidebar invisible-scrollbar">
      <ul className="wallet-links">
        {wallets.map((wallet) => {
          const isActive = currentWalletId === wallet.id
          const classes = classnames('wallet-link', {'wallet-link-active': isActive})
          return (
            <li key={wallet.id}>
              <div className={classes} {...fillActionHandlers(() => changeWallet(wallet.id))}>
                {wallet.name}
              </div>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
