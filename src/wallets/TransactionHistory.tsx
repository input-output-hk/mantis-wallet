import React from 'react'
import SVG from 'react-inlinesvg'
import {Button} from 'antd'
import {formatAmount, formatDate} from '../common/formatters'
import {Transaction} from './Wallets'
import './TransactionHistory.scss'

interface TransactionHistoryProps {
  transactions: Transaction[]
}

export const TransactionHistory = (props: TransactionHistoryProps): JSX.Element => {
  const {transactions} = props

  return (
    <div className="TransactionHistory">
      <div className="toolbar">
        <div className="title">Transaction History</div>
        <div className="line"></div>
        <div>
          <span className="sort-by">Sort by ▼</span>
          <Button type="primary" className="action">
            Send
          </Button>
          <Button type="primary" className="action">
            Receive
          </Button>
        </div>
      </div>
      {transactions.length === 0 && (
        <div className="no-transactions">
          <div className="no-transactions-text">You have no last transactions</div>
        </div>
      )}
      {transactions.length > 0 && (
        <div className="transactions-container">
          <table className="transactions">
            <tr className="header">
              <th></th>
              <th>Asset</th>
              <th>Amount</th>
              <th>Time</th>
              <th>Status</th>
              <th></th>
            </tr>
            {transactions.map((transaction) => (
              <tr key={transaction.id}>
                <td className="line">
                  <span className="type-icon">
                    &nbsp;
                    {transaction.type === 'public' && (
                      <SVG src="./icons/transparent.svg" className="svg" />
                    )}
                    {transaction.type === 'private' && (
                      <SVG src="./icons/confidental.svg" className="svg" />
                    )}
                  </span>
                </td>
                <td className="line">
                  <img src="./dust_logo.png" alt="dust" className="dust" />
                  <span>DUST</span>
                </td>
                <td className="line">
                  <span className="amount">
                    <SVG src="./icons/incoming.svg" className="svg" />
                    &nbsp;
                    {formatAmount(transaction.amount)}
                  </span>
                </td>
                <td className="line">{formatDate(transaction.time)}</td>
                <td className="line">
                  {transaction.status === 'Confirmed' && (
                    <>
                      <SVG src="./icons/check.svg" className="check" />
                      &nbsp;
                    </>
                  )}
                  {transaction.status}
                </td>
                <td className="line">
                  <SVG src="./icons/arrow-down.svg" className="svg" />
                </td>
              </tr>
            ))}
          </table>
        </div>
      )}
    </div>
  )
}
