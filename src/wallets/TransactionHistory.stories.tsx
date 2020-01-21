import React from 'react'
import {withKnobs, object, array, text} from '@storybook/addon-knobs'
import {Transaction} from './Wallets'
import {TransactionHistory} from './TransactionHistory'
import {SendTransaction} from './modals/SendTransaction'
import {ReceiveTransaction} from './modals/ReceiveTransaction'
import './TransactionHistory.scss'
import {action} from '@storybook/addon-actions'

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

export const sendTransactionModal = (): JSX.Element => (
  <SendTransaction
    accounts={array('Accounts', [
      'longprivatekey',
      'llllllllloooooooooooooonnnnnnnnnnnnggeeeeeeeeeeeeeeeeeeeeeeeeeeerrpprriivvaatteekkeeyy',
    ])}
    onCancel={action('send-transaction-cancelled')}
    visible
  />
)

export const receiveTransactionModal = (): JSX.Element => (
  <ReceiveTransaction
    receiveAccount={text('Receive Account', 'Receive Account 01')}
    receiveAddress={text(
      'Receive Address',
      '75cc353f301d9f23a3a3c936d9b306af8fbb59f43e95244fe84ff3f301d9f23a3a3c936d9b306af8fbb59f43e95244fe83f301d9f2375cc353f301d9f23a3a3c936d9b306af8fbb59f43e95244fe84ff3f301d9f23a3a3c936d9b306af8fbb5',
    )}
    usedAddresses={array('Used Addresses', [
      '75cc353f301d9f23a3a3c936d9b306af8fbb59f43e95244fe84ff3f301d9f23a3a3c936d9b306af8fbb59f43e95244fe83f301d9f2375cc353f301d9f23a3a3c936d9b306af8fbb59f43e95244fe84ff3f301d9f23a3a3c936d9b306af8fbb5',
      '85cc353f301d9f23a3a3c936d9b306af8fbb59f43e95244fe84ff3f301d9f23a3a3c936d9b306af8fbb59f43e95244fe83f301d9f2375cc353f301d9f23a3a3c936d9b306af8fbb59f43e95244fe84ff3f301d9f23a3a3c936d9b306af8fbb5',
    ])}
    onCancel={action('receive-transaction-cancelled')}
    visible
  />
)
