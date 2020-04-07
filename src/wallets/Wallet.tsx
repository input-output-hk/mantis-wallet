import React from 'react'
import {EmptyProps} from 'antd/lib/empty'
import {WalletOverview} from './WalletOverview'
import {TransactionHistory} from './TransactionHistory'
import {withStatusGuard, PropsWithWalletState} from '../common/wallet-status-guard'
import {LoadedState} from '../common/wallet-state'
import './Wallet.scss'

const _Wallet = ({walletState}: PropsWithWalletState<EmptyProps, LoadedState>): JSX.Element => {
  const {
    transactions,
    transparentBalance,
    availableBalance,
    pendingBalance,
    transparentAddresses,
    accounts,
  } = walletState.getOverviewProps()

  return (
    <div className="Wallet invisible-scrollbar">
      <WalletOverview
        pending={pendingBalance}
        confidential={availableBalance}
        transparent={transparentBalance}
      />
      <TransactionHistory
        transactions={transactions}
        transparentAddresses={transparentAddresses}
        accounts={accounts}
        availableBalance={walletState.getOverviewProps().availableBalance}
      />
    </div>
  )
}

export const Wallet = withStatusGuard(_Wallet, 'LOADED')
