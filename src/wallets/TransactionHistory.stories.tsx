import React from 'react'
import {action} from '@storybook/addon-actions'
import {withKnobs, object, text} from '@storybook/addon-knobs'
import {withWalletState} from '../storybook-util/wallet-state-decorator'
import {withTheme} from '../storybook-util/theme-switcher'
import {Transaction, Account} from '../web3'
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

const dummyTransactions: Transaction[] = [
  {
    hash: '1',
    txStatus: 'pending',
    txDetails: {
      txType: 'transfer',
    },
    txDirection: 'outgoing',
    txValue: {
      value: '0x2cc4d20.03384f2',
      fee: '0x1708f6e.516b101',
    },
  },
  {
    hash: '2',
    txStatus: 'pending',
    txDetails: {
      txType: 'transfer',
    },
    txDirection: 'outgoing',
    txValue: {
      value: '0x4f5ab6c.5fa3978',
      fee: '0x4f35875.dfb4d8',
    },
  },
  {
    hash: '3',
    txStatus: {
      status: 'confirmed',
      atBlock: '0x190a5da',
      timestamp: 1585550563,
    },
    txDetails: {
      txType: 'transfer',
    },
    txDirection: 'incoming',
    txValue: '0x100441e.28eea7e',
  },
  {
    hash: '4',
    txStatus: 'pending',
    txDetails: {
      txType: 'transfer',
    },
    txDirection: 'incoming',
    txValue: '0x54708b.9c39d60c',
  },
  {
    hash: '5',
    txStatus: {
      status: 'confirmed',
      atBlock: '0x2545dbb',
      timestamp: 1585294963,
    },
    txDetails: {
      txType: 'transfer',
    },
    txDirection: 'outgoing',
    txValue: {
      value: '0x1cbb3d6.1494927',
      fee: '0x221f4c2.94e79a6',
    },
  },
  {
    hash: '6',
    txStatus: {
      status: 'confirmed',
      atBlock: '0xb70ef5',
      timestamp: 1585122163,
    },
    txDetails: {
      txType: 'transfer',
    },
    txDirection: 'incoming',
    txValue: '0x113a306.f156b0e',
  },
  {
    hash: '7',
    txStatus: 'pending',
    txDetails: {
      txType: 'transfer',
    },
    txDirection: 'incoming',
    txValue: '0x4c45dce.3ca6d58',
  },
  {
    hash: '8',
    txStatus: 'pending',
    txDetails: {
      txType: 'transfer',
    },
    txDirection: 'outgoing',
    txValue: {
      value: '0x20ea438.060343e',
      fee: '0x53bcf60.d812144',
    },
  },
  {
    hash: '9',
    txStatus: {
      status: 'confirmed',
      atBlock: '0x95c3c2',
      timestamp: 1585118563,
    },
    txDetails: {
      txType: 'transfer',
    },
    txDirection: 'incoming',
    txValue: '0xaeccfd.332a645',
  },
]

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
            timestamp: 1584527520,
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
            timestamp: 1584527720,
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
