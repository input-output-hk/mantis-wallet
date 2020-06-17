import React from 'react'
import BigNumber from 'bignumber.js'
import {action} from '@storybook/addon-actions'
import {object, text} from '@storybook/addon-knobs'
import {ESSENTIAL_DECORATORS} from '../storybook-util/essential-decorators'
import {Transaction, Account} from '../web3'
import {toHex} from '../common/util'
import {withWalletState} from '../storybook-util/wallet-state-decorator'
import {withBuildJobState} from '../storybook-util/build-job-state-decorator'
import {dust, asyncAction} from '../storybook-util/custom-knobs'
import {
  dummyTransactions,
  estimateFeesWithRandomDelay,
  CONFIDENTIAL_ADDRESS,
  TRANSPARENT_ADDRESSES,
} from '../storybook-util/dummies'
import {SendTransaction} from './modals/SendTransaction'
import {ReceiveTransaction} from './modals/ReceiveTransaction'
import {TransactionHistory} from './TransactionHistory'

export default {
  title: 'Transaction History',
  decorators: [...ESSENTIAL_DECORATORS, withWalletState, withBuildJobState],
}

const accounts: Account[] = [
  {
    wallet: 'Wallet',
    address: 'Foobar',
    locked: false,
  },
]

export const withNoTransactions = (): JSX.Element => (
  <TransactionHistory
    transactions={[]}
    transparentAddresses={[]}
    accounts={accounts}
    availableBalance={new BigNumber(0)}
    sendTransaction={asyncAction('on-send-transaction')}
    sendTxToTransparent={asyncAction('on-send-tx-to-transparent')}
    estimateGasPrice={estimateFeesWithRandomDelay}
    estimateTransactionFee={estimateFeesWithRandomDelay}
    estimatePublicTransactionFee={estimateFeesWithRandomDelay}
    generateAddress={asyncAction('on-generate-address')}
    goToAccounts={action('on-go-to-accounts')}
  />
)

export const withDemoTransactions = (): JSX.Element => (
  <TransactionHistory
    transactions={dummyTransactions}
    transparentAddresses={[]}
    accounts={accounts}
    availableBalance={dust('Available Balance', 1000)}
    sendTransaction={asyncAction('on-send-transaction')}
    sendTxToTransparent={asyncAction('on-send-tx-to-transparent')}
    estimateGasPrice={estimateFeesWithRandomDelay}
    estimateTransactionFee={estimateFeesWithRandomDelay}
    estimatePublicTransactionFee={estimateFeesWithRandomDelay}
    generateAddress={asyncAction('on-generate-address')}
    goToAccounts={action('on-go-to-accounts')}
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
      availableBalance={dust('Available Balance', 1000)}
      sendTransaction={asyncAction('on-send-transaction')}
      sendTxToTransparent={asyncAction('on-send-tx-to-transparent')}
      estimateGasPrice={estimateFeesWithRandomDelay}
      estimateTransactionFee={estimateFeesWithRandomDelay}
      estimatePublicTransactionFee={estimateFeesWithRandomDelay}
      generateAddress={asyncAction('on-generate-address')}
      goToAccounts={action('on-go-to-accounts')}
    />
  )
}

export const sendConfidentialTransaction = (): JSX.Element => (
  <SendTransaction
    accounts={[
      {
        wallet: 'wallet 1',
        address: text('First address', CONFIDENTIAL_ADDRESS),
        locked: false,
      },
      {
        wallet: 'wallet 2',
        address: text('Second address', 'second-address'),
        locked: false,
      },
    ]}
    availableAmount={dust('Available Amount', 123.456)}
    onCancel={action('send-transaction-cancelled')}
    onSend={asyncAction('on-send')}
    onSendToTransparent={asyncAction('on-send-to-transparent')}
    estimateGasPrice={estimateFeesWithRandomDelay}
    estimateTransactionFee={estimateFeesWithRandomDelay}
    estimatePublicTransactionFee={estimateFeesWithRandomDelay}
    defaultMode="confidential"
    visible
  />
)

export const sendTransparentTransaction = (): JSX.Element => (
  <SendTransaction
    accounts={[
      {
        wallet: 'wallet 1',
        address: text('First address', CONFIDENTIAL_ADDRESS),
        locked: false,
      },
      {
        wallet: 'wallet 2',
        address: text('Second address', 'second-address'),
        locked: false,
      },
    ]}
    availableAmount={dust('Available Amount', 123.456)}
    onCancel={action('send-transaction-cancelled')}
    onSend={asyncAction('on-send')}
    onSendToTransparent={asyncAction('on-send-to-transparent')}
    estimateGasPrice={estimateFeesWithRandomDelay}
    estimateTransactionFee={estimateFeesWithRandomDelay}
    estimatePublicTransactionFee={estimateFeesWithRandomDelay}
    defaultMode="transparent"
    visible
  />
)

export const receiveConfidentialTransaction = (): JSX.Element => (
  <ReceiveTransaction
    privateAddress={text('Private address', CONFIDENTIAL_ADDRESS)}
    transparentAddresses={[]}
    onCancel={action('receive-transaction-cancelled')}
    onGenerateNew={asyncAction('generate-new')}
    goToAccounts={action('on-go-to-accounts')}
    defaultMode="confidential"
    visible
  />
)

export const receiveTransparentTransaction = (): JSX.Element => (
  <ReceiveTransaction
    privateAddress={text('Private address', CONFIDENTIAL_ADDRESS)}
    transparentAddresses={TRANSPARENT_ADDRESSES}
    onCancel={action('receive-transaction-cancelled')}
    onGenerateNew={asyncAction('generate-new')}
    goToAccounts={action('on-go-to-accounts')}
    defaultMode="transparent"
    visible
  />
)

export const receiveTransparentTransactionEmptyModal = (): JSX.Element => (
  <ReceiveTransaction
    privateAddress={text('Private address', CONFIDENTIAL_ADDRESS)}
    transparentAddresses={[]}
    onCancel={action('receive-transaction-cancelled')}
    onGenerateNew={asyncAction('generate-new')}
    goToAccounts={action('on-go-to-accounts')}
    defaultMode="transparent"
    visible
  />
)
