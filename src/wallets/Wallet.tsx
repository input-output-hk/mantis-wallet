import React, {useState} from 'react'
import {EmptyProps} from 'antd/lib/empty'
import BigNumber from 'bignumber.js'
import {WalletOverview} from './WalletOverview'
import {TransactionHistory} from './TransactionHistory'
import {withStatusGuard, PropsWithWalletState} from '../common/wallet-status-guard'
import {LoadedState} from '../common/wallet-state'
import {TransparentAccounts} from './TransparentAccounts'

export type WalletViewMode = 'transactions' | 'accounts'

const _Wallet = ({walletState}: PropsWithWalletState<EmptyProps, LoadedState>): JSX.Element => {
  const {
    transactions,
    transparentBalance,
    availableBalance,
    pendingBalance,
    transparentAccounts,
    accounts,
  } = walletState.getOverviewProps()

  const [viewType, setViewType] = useState<WalletViewMode>('transactions')

  return (
    <div className="Wallet invisible-scrollbar">
      <WalletOverview
        pending={pendingBalance}
        confidential={availableBalance}
        transparent={transparentBalance}
      />
      {viewType === 'transactions' && (
        <TransactionHistory
          transactions={transactions}
          transparentAddresses={transparentAccounts}
          accounts={accounts}
          availableBalance={availableBalance}
          sendTransaction={async (
            recipient: string,
            amount: number,
            fee: number,
          ): Promise<void> => {
            await walletState.sendTransaction(recipient, amount, fee)
          }}
          sendTxToTransparent={async (
            recipient: string,
            amount: BigNumber,
            gasPrice: BigNumber,
          ): Promise<void> => {
            await walletState.sendTxToTransparent(recipient, amount, gasPrice)
          }}
          estimateGasPrice={walletState.estimateGasPrice}
          estimateTransactionFee={walletState.estimateTransactionFee}
          estimatePublicTransactionFee={walletState.estimatePublicTransactionFee}
          generateAddress={walletState.generateNewAddress}
          goToAccounts={() => setViewType('accounts')}
        />
      )}
      {viewType === 'accounts' && (
        <TransparentAccounts
          transparentAccounts={transparentAccounts}
          generateAddress={walletState.generateNewAddress}
          redeem={async (address: string, amount: number, fee: number): Promise<void> => {
            await walletState.redeemValue(address, amount, fee)
          }}
          estimateRedeemFee={walletState.estimateRedeemFee}
          backToTransactions={() => setViewType('transactions')}
          transactions={transactions}
        />
      )}
    </div>
  )
}

export const Wallet = withStatusGuard(_Wallet, 'LOADED')
