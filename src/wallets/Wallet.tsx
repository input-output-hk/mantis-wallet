import React, {useState} from 'react'
import {EmptyProps} from 'antd/lib/empty'
import BigNumber from 'bignumber.js'
import {WalletOverview} from './WalletOverview'
import {TransactionHistory} from './TransactionHistory'
import {withStatusGuard, PropsWithWalletState} from '../common/wallet-status-guard'
import {LoadedState} from '../common/wallet-state'
import {TransparentAccounts} from './TransparentAccounts'
import {ExtendedTransaction} from './TransactionRow'

export type WalletViewMode = 'transactions' | 'accounts'

const _Wallet = ({walletState}: PropsWithWalletState<EmptyProps, LoadedState>): JSX.Element => {
  const {
    transactions,
    transparentBalance,
    availableBalance,
    pendingBalance,
    transparentAccounts,
  } = walletState.getOverviewProps()
  const {callTxStatuses} = walletState

  const [viewType, setViewType] = useState<WalletViewMode>('transactions')
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
      <WalletOverview
        pending={pendingBalance}
        confidential={availableBalance}
        transparent={transparentBalance}
        viewType={viewType}
      />
      {viewType === 'transactions' && (
        <TransactionHistory
          transactions={extendedTransactions}
          transparentAddresses={transparentAccounts}
          privateAddresses={walletState.privateAccounts}
          availableBalance={availableBalance}
          sendTransaction={async (recipient: string, amount: number, fee: number, memo: string) => {
            await walletState.sendTransaction(recipient, amount, fee, memo)
          }}
          sendTxToTransparent={async (
            recipient: string,
            amount: BigNumber,
            fee: BigNumber,
          ): Promise<void> => {
            await walletState.sendTxToTransparent(recipient, amount, fee)
          }}
          estimateTransactionFee={walletState.estimateTransactionFee}
          estimatePublicTransactionFee={walletState.estimatePublicTransactionFee}
          generateTransparentAddress={walletState.generateTransparentAccount}
          generatePrivateAddress={walletState.generatePrivateAccount}
          goToAccounts={() => setViewType('accounts')}
        />
      )}
      {viewType === 'accounts' && (
        <TransparentAccounts
          transparentAccounts={transparentAccounts}
          generateAddress={walletState.generateTransparentAccount}
          redeem={async (address: string, amount: number, fee: number): Promise<void> => {
            await walletState.redeemValue(address, amount, fee)
          }}
          estimateRedeemFee={walletState.estimateRedeemFee}
          backToTransactions={() => setViewType('transactions')}
          transactions={extendedTransactions}
        />
      )}
    </div>
  )
}

export const Wallet = withStatusGuard(_Wallet, 'LOADED')
