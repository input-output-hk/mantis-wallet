import React from 'react'
import {EmptyProps} from 'antd/lib/empty'
import {WalletOverview} from './WalletOverview'
import {TransactionHistory} from './TransactionHistory'
import {withStatusGuard, PropsWithWalletState} from '../common/wallet-status-guard'
import {LoadedState} from '../common/wallet-state'

const _Wallet = ({walletState}: PropsWithWalletState<EmptyProps, LoadedState>): JSX.Element => {
  const {transactions, availableBalance} = walletState.getOverviewProps()

  return (
    <div className="Wallet invisible-scrollbar">
      <WalletOverview availableBalance={availableBalance} />
      <TransactionHistory
        transactions={transactions}
        accounts={walletState.accounts}
        availableBalance={availableBalance}
        estimateTransactionFee={walletState.estimateTransactionFee}
        generateAddress={walletState.generateAccount}
      />
    </div>
  )
}

export const Wallet = withStatusGuard(_Wallet, 'LOADED')
