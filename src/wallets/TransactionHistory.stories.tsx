import React from 'react'
import {withKnobs, object} from '@storybook/addon-knobs'
import {Transaction} from './Wallets'
import {TransactionHistory} from './TransactionHistory'
import './TransactionHistory.scss'

export default {
  title: 'Transaction History',
  decorators: [withKnobs],
}

export const withNoTransactions = (): JSX.Element => <TransactionHistory transactions={[]} />

const dummyTransactions = [...Array(10).keys()].slice(1).map(
  (n): Transaction => ({
    id: n,
    type: Math.random() < 0.5 ? 'private' : 'public',
    amount: Math.random() * 1000,
    time: new Date(),
    status: Math.random() < 0.5 ? 'Confirmed' : 'Pending',
  }),
)

export const withDemoTransactions = (): JSX.Element => (
  <TransactionHistory transactions={dummyTransactions} />
)

export const interactive = (): JSX.Element => {
  return (
    <TransactionHistory
      transactions={[
        object<Transaction>('Transaction 1', {
          id: 1,
          type: 'private',
          amount: 1000.0,
          time: new Date(),
          status: 'Confirmed',
        }),
        object<Transaction>('Transaction 2', {
          id: 1,
          type: 'public',
          amount: 1000.0,
          time: new Date(),
          status: 'Confirmed',
        }),
        object<Transaction>('Transaction 3', {
          id: 1,
          type: 'private',
          amount: 1000.0,
          time: new Date(),
          status: 'Pending',
        }),
      ]}
    />
  )
}
