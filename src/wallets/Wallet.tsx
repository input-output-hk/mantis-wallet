import React from 'react'
import {EmptyProps} from 'antd/lib/empty'
import {TransactionHistory} from './TransactionHistory'
import {withStatusGuard, PropsWithWalletState} from '../common/wallet-status-guard'
import {LoadedState} from '../common/wallet-state'
import './Wallet.scss'

const _Wallet = ({
  walletState: {
    transactions,
    availableBalance,
    accounts,
    estimateTransactionFee,
    getNextNonce,
    generateAccount,
    syncStatus,
  },
}: PropsWithWalletState<EmptyProps, LoadedState>): JSX.Element => {
  return (
    <div className="Wallet invisible-scrollbar">
      <TransactionHistory
        transactions={transactions}
        accounts={accounts}
        availableBalance={availableBalance}
        estimateTransactionFee={estimateTransactionFee}
        getNextNonce={getNextNonce}
        generateAddress={generateAccount}
        syncStatus={syncStatus}
      />
    </div>
  )
}

export const Wallet = withStatusGuard(_Wallet, 'LOADED')
