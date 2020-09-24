import React from 'react'
import {EmptyProps} from 'antd/lib/empty'
import {WalletOverview} from './WalletOverview'
import {TransactionHistory} from './TransactionHistory'
import {withStatusGuard, PropsWithWalletState} from '../common/wallet-status-guard'
import {LoadedState} from '../common/wallet-state'
import {Wei} from '../common/units'

const _Wallet = ({walletState}: PropsWithWalletState<EmptyProps, LoadedState>): JSX.Element => {
  const {transactions, availableBalance} = walletState.getOverviewProps()

  return (
    <div className="Wallet invisible-scrollbar">
      <WalletOverview availableBalance={availableBalance} />
      <TransactionHistory
        transactions={transactions}
        accounts={walletState.accounts}
        availableBalance={availableBalance}
        sendTransaction={async (recipient: string, amount: Wei, fee: Wei) => {
          await walletState.sendTransaction(recipient, amount, fee)
        }}
        estimateTransactionFee={walletState.estimateTransactionFee}
        generateAddress={walletState.generateAccount}
      />
    </div>
  )
}

export const Wallet = withStatusGuard(_Wallet, 'LOADED')
