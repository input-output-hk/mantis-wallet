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

export const withNoTransactions = (): JSX.Element => (
  <TransactionHistory transactions={[]} transparentAddresses={[]} />
)

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
  <TransactionHistory transactions={dummyTransactions} transparentAddresses={[]} />
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
      transparentAddresses={[
        {
          address: text('Old address', 'old-address'),
          index: 0,
        },
        {
          address: text('New address', 'new-address'),
          index: 1,
        },
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
    transparentAddresses={[
      {
        address: text('Old address', 'old-address'),
        index: 0,
      },
      {
        address: text('New address', 'new-address'),
        index: 1,
      },
    ]}
    onCancel={action('receive-transaction-cancelled')}
    onGenerateNew={async (): Promise<void> => action('generate-new')()}
    visible
  />
)

export const emptyTransactionModal = (): JSX.Element => (
  <ReceiveTransaction
    transparentAddresses={[]}
    onCancel={action('receive-transaction-cancelled')}
    onGenerateNew={async (): Promise<void> => action('generate-new')()}
    visible
  />
)
