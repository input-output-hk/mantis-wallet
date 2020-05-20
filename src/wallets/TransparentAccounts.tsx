import React, {useState} from 'react'
import {Button, message} from 'antd'
import BigNumber from 'bignumber.js'
import {ThemeState} from '../theme-state'
import {CopyableLongText} from '../common/CopyableLongText'
import {ShortNumber} from '../common/ShortNumber'
import {TransparentAccount, FeeEstimates} from '../common/wallet-state'
import {RedeemModal} from './modals/RedeemModal'
import dustIconDark from '../assets/dark/dust.png'
import dustIconLight from '../assets/light/dust.png'
import {Transaction} from '../web3'
import {TransactionRow, transactionTableStyle} from './TransactionHistory'
import './TransparentAccounts.scss'

interface ShowAccountProps {
  account: TransparentAccount
  redeem: () => void
  transactions: Transaction[]
}

const ShowTransparentAccount: React.FunctionComponent<ShowAccountProps> = ({
  account,
  redeem,
  transactions,
}: ShowAccountProps) => {
  const themeState = ThemeState.useContainer()
  const dustIcon = themeState.theme === 'dark' ? dustIconDark : dustIconLight
  const [transactionsVisible, setTransactionVisible] = useState(false)

  return (
    <>
      <div className="transparent-account">
        <div className="info">
          <div>
            <CopyableLongText content={account.address} showQrCode />
          </div>
          <div>
            <img src={dustIcon} alt="dust" className="dust" />
            <span>DUST</span>
          </div>
          <div>
            <span className="amount">
              <ShortNumber big={account.balance} />
            </span>
          </div>
          <div className="actions">
            <Button
              type="primary"
              className="action"
              onClick={redeem}
              disabled={account.balance.isZero()}
            >
              Apply Confidentiality
            </Button>
            <Button
              type="primary"
              className="action secondary"
              onClick={() => setTransactionVisible(!transactionsVisible)}
              disabled={transactions.length === 0}
            >
              Transactions
            </Button>
          </div>
        </div>
        {transactionsVisible && transactions.length > 0 && (
          <div className="transactions-container">
            <div className="transactions" style={transactionTableStyle}>
              {transactions
                .map(
                  (tx: Transaction): Transaction =>
                    // this is necessary for txs between a single user's accounts
                    // where it is always shown as outgoing
                    tx.txDetails.txType === 'call' &&
                    tx.txDirection === 'outgoing' &&
                    tx.txDetails.transparentTransaction.receivingAddress === account.address
                      ? {...tx, txDirection: 'incoming', txValue: tx.txValue.value}
                      : tx,
                )
                .map((tx: Transaction) => (
                  <TransactionRow transaction={tx} key={tx.hash} />
                ))}
            </div>
          </div>
        )}
      </div>
    </>
  )
}

interface TransparentAccountsProps {
  transparentAccounts: TransparentAccount[]
  generateAddress: () => void
  redeem: (address: string, amount: number, fee: number) => Promise<void>
  estimateRedeemFee: (amount: BigNumber) => Promise<FeeEstimates>
  backToTransactions: () => void
  transactions: Transaction[]
}

export const TransparentAccounts: React.FunctionComponent<TransparentAccountsProps> = ({
  transparentAccounts,
  generateAddress,
  redeem,
  estimateRedeemFee,
  backToTransactions,
  transactions,
}: TransparentAccountsProps) => {
  const [showRedeem, setShowRedeem] = useState(false)
  const [transparentAccount, setTransparentAccount] = useState<TransparentAccount | null>(null)

  const handleRedeem = (transparentAccount: TransparentAccount): void => {
    setTransparentAccount(transparentAccount)
    setShowRedeem(true)
  }

  const transparentTransactions = transactions.filter(
    ({txDetails}) => txDetails.txType === 'redeem' || txDetails.txType === 'call',
  )

  return (
    <div className="TransparentAccounts">
      <div className="toolbar">
        <div className="main-title">Transparent Accounts</div>
        <div className="line"></div>
        <div>
          <Button
            type="primary"
            className="action"
            onClick={async (): Promise<void> => {
              try {
                await generateAddress()
                message.success('New transparent address was generated')
              } catch (e) {
                console.error(e)
                message.error(<div style={{width: '500px', float: 'right'}}>{e.message}</div>, 10)
              }
            }}
          >
            Generate New Address
          </Button>
          <Button type="primary" className="action secondary" onClick={backToTransactions}>
            Back to Overview
          </Button>
        </div>
      </div>
      <div className="accounts">
        {transparentAccounts.length === 0 && (
          <div className="no-accounts-text">
            You have no transparent accounts. Click on &#34;Generate New Address&#34; to generate
            one.
          </div>
        )}
        {transparentAccounts.length > 0 && (
          <div className="list-accounts">
            <div className="header">
              <div>Account</div>
              <div>Asset</div>
              <div>Amount</div>
              <div></div>
            </div>
            {transparentAccounts.map((a) => (
              <ShowTransparentAccount
                account={a}
                key={a.address}
                redeem={() => handleRedeem(a)}
                transactions={transparentTransactions.filter(
                  ({txDetails}) =>
                    (txDetails.txType === 'redeem' &&
                      a.index === txDetails.usedTransparentAccountIndex) ||
                    (txDetails.txType === 'call' &&
                      txDetails.usedTransparentAccountIndexes.includes(a.index)),
                )}
              />
            ))}
          </div>
        )}
      </div>
      {transparentAccount != null && showRedeem && (
        <RedeemModal
          visible
          onCancel={() => setShowRedeem(false)}
          transparentAccount={transparentAccount}
          redeem={async (address: string, amount: number, fee: number): Promise<void> => {
            await redeem(address, amount, fee)
            setShowRedeem(false)
          }}
          estimateRedeemFee={estimateRedeemFee}
        />
      )}
    </div>
  )
}
