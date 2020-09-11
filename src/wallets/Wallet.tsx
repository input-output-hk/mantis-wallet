import React from 'react'
import {EmptyProps} from 'antd/lib/empty'
import {WalletOverview} from './WalletOverview'
import {TransactionHistory} from './TransactionHistory'
import {withStatusGuard, PropsWithWalletState} from '../common/wallet-status-guard'
import {LoadedState} from '../common/wallet-state'
import {ExtendedTransaction} from './TransactionRow'

const _Wallet = ({walletState}: PropsWithWalletState<EmptyProps, LoadedState>): JSX.Element => {
  const {transactions, availableBalance, transparentAccounts} = walletState.getOverviewProps()
  const {callTxStatuses} = walletState

  const extendedTransactions = transactions.map(
    (t): ExtendedTransaction =>
      t.txDetails.txType === 'call'
        ? {
            ...t,
            txDetails: {
              ...t.txDetails,
              callTxStatus: callTxStatuses[t.hash] ?? {status: 'TransactionPending'},
            },
          }
        : (t as ExtendedTransaction),
  )

  return (
    <div className="Wallet invisible-scrollbar">
      <WalletOverview availableBalance={availableBalance} />
      <TransactionHistory
        transactions={extendedTransactions}
        transparentAddresses={transparentAccounts}
        privateAddresses={walletState.privateAccounts}
        availableBalance={availableBalance}
        sendTransaction={async (recipient: string, amount: number, fee: number, memo: string) => {
          await walletState.sendTransaction(recipient, amount, fee, memo)
        }}
        estimateTransactionFee={walletState.estimateTransactionFee}
        generateTransparentAddress={walletState.generateTransparentAccount}
        generatePrivateAddress={walletState.generatePrivateAccount}
      />
    </div>
  )
}

export const Wallet = withStatusGuard(_Wallet, 'LOADED')
