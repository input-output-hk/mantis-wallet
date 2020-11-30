import React from 'react'
import {EmptyProps} from 'antd/lib/empty'
import {TransactionHistory} from './TransactionHistory'
import {withStatusGuard, PropsWithWalletState} from '../common/wallet-status-guard'
import {LoadedState} from '../common/wallet-state'
import './Wallet.scss'

const _Wallet = ({walletState}: PropsWithWalletState<EmptyProps, LoadedState>): JSX.Element => {
  const {transactions, availableBalance} = walletState.getOverviewProps()

  return (
    <div className="Wallet invisible-scrollbar">
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
