import React from 'react'
import {action} from '@storybook/addon-actions'
import {withKnobs, object, text} from '@storybook/addon-knobs'
import {withWalletState} from '../storybook-util/wallet-state-decorator'
import {withTheme} from '../storybook-util/theme-switcher'
import {Transaction, Account, TxStatus, TxDetailsIncAndOut} from '../web3'
import {toHex} from '../common/util'
import {TransactionHistory} from './TransactionHistory'
import {SendTransaction} from './modals/SendTransaction'
import {ReceiveTransaction} from './modals/ReceiveTransaction'
import './TransactionHistory.scss'

export default {
  title: 'Transaction History',
  decorators: [withWalletState, withTheme, withKnobs],
}

const accounts: Account[] = [
  {
    wallet: 'Wallet',
    address: 'Foobar',
    locked: false,
  },
]

export const withNoTransactions = (): JSX.Element => (
  <TransactionHistory transactions={[]} transparentAddresses={[]} accounts={accounts} />
)

const dummyTransactions = [...Array(10).keys()].slice(1).map(
  (n): Transaction => {
    const isIncoming = Math.random() < 0.5
    const value = toHex(Math.random() * 100000000)

    const baseTx = {
      hash: n.toString(),
      txStatus:
        Math.random() < 0.5
          ? 'pending'
          : ({
              status: 'confirmed',
              atBlock: toHex(Math.random() * 100000000),
            } as TxStatus),
      txDetails: {
        txType: 'transfer',
      } as TxDetailsIncAndOut,
    }

    if (isIncoming) {
      return {...baseTx, txDirection: 'incoming', txValue: value}
    } else {
      return {
        ...baseTx,
        txDirection: 'outgoing',
        txValue: {value, fee: toHex(Math.random() * 100000000)},
      }
    }
  },
)

export const withDemoTransactions = (): JSX.Element => (
  <TransactionHistory
    transactions={dummyTransactions}
    transparentAddresses={[]}
    accounts={accounts}
  />
)

export const interactive = (): JSX.Element => {
  return (
    <TransactionHistory
      transactions={[
        object<Transaction>('Transaction 1', {
          hash: '1',
          txDirection: 'outgoing',
          txValue: {
            value: toHex(1000.0),
            fee: toHex(1000.0),
          },
          txStatus: {
            status: 'confirmed',
            atBlock: '0x1',
          },
          txDetails: {
            txType: 'transfer',
          },
        }),
        object<Transaction>('Transaction 2', {
          hash: '2',
          txDirection: 'incoming',
          txValue: toHex(1000.0),
          txStatus: {
            status: 'confirmed',
            atBlock: '0x1',
          },
          txDetails: {
            txType: 'transfer',
          },
        }),
        object<Transaction>('Transaction 3', {
          hash: '3',
          txDirection: 'incoming',
          txValue: toHex(1000.0),
          txStatus: 'pending',
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
      accounts={[
        {
          wallet: 'wallet 1',
          address: text('First address', 'first-address'),
          locked: false,
        },
        {
          wallet: 'wallet 2',
          address: text('Second address', 'second-address'),
          locked: false,
        },
      ]}
    />
  )
}

export const sendTransactionModal = (): JSX.Element => (
  <SendTransaction
    accounts={[
      {
        wallet: 'wallet 1',
        address: text('First address', 'first-address'),
        locked: false,
      },
      {
        wallet: 'wallet 2',
        address: text('Second address', 'second-address'),
        locked: false,
      },
    ]}
    onCancel={action('send-transaction-cancelled')}
    onSend={async (recipient, amount, fee): Promise<void> =>
      action('generate-new')(recipient, amount, fee)
    }
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
