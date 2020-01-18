import React from 'react'
import {action} from '@storybook/addon-actions'
import {withKnobs, object, array, text} from '@storybook/addon-knobs'
import {Transaction} from '../web3'
import {TransactionHistory} from './TransactionHistory'
import {SendTransaction} from './modals/SendTransaction'
import {ReceiveTransaction} from './modals/ReceiveTransaction'
import './TransactionHistory.scss'

export default {
  title: 'Transaction History',
  decorators: [withKnobs],
}

export const withNoTransactions = (): JSX.Element => <TransactionHistory transactions={[]} />

const dummyTransactions = [...Array(10).keys()].slice(1).map(
  (n): Transaction => ({
    hash: n.toString(),
    txDirection: Math.random() < 0.5 ? 'incoming' : 'outgoing',
    txValue: (Math.random() * 100000000).toString(16),
    txStatus: {
      status: Math.random() < 0.5 ? 'confirmed' : 'pending',
    },
    txDetails: {
      txType: 'transfer',
    },
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
          hash: '1',
          txDirection: 'outgoing',
          txValue: (1000.0).toString(16),
          txStatus: {
            status: 'confirmed',
          },
          txDetails: {
            txType: 'transfer',
          },
        }),
        object<Transaction>('Transaction 2', {
          hash: '2',
          txDirection: 'incoming',
          txValue: (1000.0).toString(16),
          txStatus: {
            status: 'confirmed',
          },
          txDetails: {
            txType: 'transfer',
          },
        }),
        object<Transaction>('Transaction 3', {
          hash: '3',
          txDirection: 'incoming',
          txValue: (1000.0).toString(16),
          txStatus: {
            status: 'pending',
          },
          txDetails: {
            txType: 'transfer',
          },
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
