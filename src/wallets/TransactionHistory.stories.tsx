import React from 'react'
import {action} from '@storybook/addon-actions'
import {text, object} from '@storybook/addon-knobs'
import {some} from 'fp-ts/lib/Option'
import {ESSENTIAL_DECORATORS} from '../storybook-util/essential-decorators'
import {ether, asyncAction} from '../storybook-util/custom-knobs'
import {
  estimateFeesWithRandomDelay,
  ADDRESS,
  dummyTransactions,
  dummyAccounts,
  getNextNonceWithRandomDelay,
} from '../storybook-util/dummies'
import {SendTransactionFlow} from './modals/SendTransaction'
import {ReceiveTransaction} from './modals/ReceiveTransaction'
import {TransactionHistory} from './TransactionHistory'
import {asWei, asEther} from '../common/units'
import {
  SendBasicTransaction,
  SendAdvancedTransaction,
  ConfirmAdvancedTransaction,
  ConfirmBasicTransaction,
} from './sendTransaction'
import {wrapWithModal} from '../common/MantisModal'
import {Transaction} from './history'
import {mockSyncStatus} from './TransactionHistory.test'

export default {
  title: 'Transaction History',
  decorators: ESSENTIAL_DECORATORS,
}

export const withNoTransactions = (): JSX.Element => (
  <TransactionHistory
    transactions={[]}
    accounts={dummyAccounts}
    availableBalance={some(asWei(0))}
    estimateTransactionFee={estimateFeesWithRandomDelay}
    getNextNonce={getNextNonceWithRandomDelay}
    generateAddress={asyncAction('on-generate-address')}
    syncStatus={mockSyncStatus}
  />
)

export const withDemoTransactions = (): JSX.Element => (
  <TransactionHistory
    transactions={dummyTransactions}
    accounts={dummyAccounts}
    availableBalance={some(ether('Available Balance', 1000))}
    estimateTransactionFee={estimateFeesWithRandomDelay}
    getNextNonce={getNextNonceWithRandomDelay}
    generateAddress={asyncAction('on-generate-address')}
    syncStatus={mockSyncStatus}
  />
)

export const interactive = (): JSX.Element => {
  return (
    <TransactionHistory
      transactions={[
        object<Transaction>('Transaction 1', {
          hash: '1',
          from: '0x00112233445566778899aabbccddeeff00112233',
          to: '0xffeeddccbbaa0011223344556677889988776655',
          blockNumber: 1,
          timestamp: new Date(1585118001),
          value: asEther(123),
          gasPrice: asWei(1e9),
          gas: 21000,
          gasUsed: 21000,
          fee: asWei(0),
          direction: 'incoming',
          status: 'persisted_depth',
          contractAddress: null,
        }),
        object<Transaction>('Transaction 2', {
          hash: '2',
          from: '0x00112233445566778899aabbccddeeff00112233',
          to: '0xffeeddccbbaa0011223344556677889988776655',
          blockNumber: 1,
          timestamp: new Date(1585118200),
          value: asEther(123),
          gasPrice: asWei(1e9),
          gas: 21000,
          gasUsed: 21000,
          fee: asWei(0),
          direction: 'incoming',
          status: 'confirmed',
          contractAddress: null,
        }),
        object<Transaction>('Transaction 3', {
          hash: '3',
          from: '0xffeeddccbbaa0011223344556677889988776655',
          to: '0x00112233445566778899aabbccddeeff00112233',
          blockNumber: null,
          timestamp: null,
          value: asEther(123456789),
          gasPrice: asWei(1e9),
          gas: 21000,
          gasUsed: null,
          fee: asWei(21000 * 1e9),
          direction: 'outgoing',
          status: 'pending',
          contractAddress: null,
        }),
        object<Transaction>('Transaction 4', {
          hash: '4',
          from: '0x00112233445566778899aabbccddeeff00112233',
          to: '0xffeeddccbbaa0011223344556677889988776655',
          blockNumber: 1,
          timestamp: new Date(1585118001),
          value: asEther(123),
          gasPrice: asWei(1e9),
          gas: 21000,
          gasUsed: 21000,
          fee: asWei(0),
          direction: 'incoming',
          status: 'persisted_checkpoint',
          contractAddress: null,
        }),
      ]}
      accounts={dummyAccounts}
      availableBalance={some(ether('Available Balance', 1000))}
      estimateTransactionFee={estimateFeesWithRandomDelay}
      getNextNonce={getNextNonceWithRandomDelay}
      generateAddress={asyncAction('on-generate-address')}
      syncStatus={mockSyncStatus}
    />
  )
}

export const sendTransaction = (): JSX.Element => (
  <SendTransactionFlow
    availableAmount={ether('Available Amount', 123.456)}
    onCancel={action('send-transaction-cancelled')}
    estimateTransactionFee={estimateFeesWithRandomDelay}
    getNextNonce={getNextNonceWithRandomDelay}
    visible
  />
)

const _SendBasicTransaction = wrapWithModal(
  () => (
    <SendBasicTransaction
      availableAmount={ether('Available Amount', 123.456)}
      onCancel={action('send-transaction-cancelled')}
      estimateTransactionFee={estimateFeesWithRandomDelay}
      transactionParams={{
        amount: '123',
        fee: '0.00000000001',
        recipient: '0xffeeddccbbaa0011223344556677889988776655',
      }}
      onSend={action('send-transaction')}
      setTransactionParams={action('set-transaction-params')}
      visible
    />
  ),
  'BasicTransaction',
)

export const sendBasicTransaction = (): JSX.Element => <_SendBasicTransaction visible />

const _SendAdvancedTransaction = wrapWithModal(() => (
  <SendAdvancedTransaction
    onCancel={action('send-transaction-cancelled')}
    estimateTransactionFee={estimateFeesWithRandomDelay}
    availableAmount={ether('Available Amount', 123.456)}
    transactionParams={{
      amount: '123',
      gasLimit: '21000',
      gasPrice: '0.00000000001',
      recipient: '0xffeeddccbbaa0011223344556677889988776655',
      data: '0xaaaaaaaa',
      nonce: '111',
    }}
    onSend={action('send-transaction')}
    setTransactionParams={action('set-transaction-params')}
  />
))

export const sendAdvancedTransaction = (): JSX.Element => <_SendAdvancedTransaction visible />

const _ConfirmBasicTransaction = wrapWithModal(() => (
  <ConfirmBasicTransaction
    onCancel={action('confirm-transaction-cancelled')}
    transactionParams={{
      amount: '123',
      fee: '0.00000000001',
      recipient: '0xffeeddccbbaa0011223344556677889988776655',
    }}
    onClose={action('confirm-transaction-closed')}
  />
))

export const confirmBasicTransaction = (): JSX.Element => <_ConfirmBasicTransaction visible />

const _ConfirmAdvancedTransaction = wrapWithModal(() => (
  <ConfirmAdvancedTransaction
    onCancel={action('confirm-transaction-cancelled')}
    transactionParams={{
      amount: '123',
      gasLimit: '21000',
      gasPrice: '0.00000000001',
      recipient: '0xffeeddccbbaa0011223344556677889988776655',
      data: '0xaaaaaaaa',
      nonce: '111',
    }}
    onClose={action('confirm-transaction-closed')}
  />
))

export const confirmAdvancedTransaction = (): JSX.Element => <_ConfirmAdvancedTransaction visible />

export const receiveTransaction = (): JSX.Element => (
  <ReceiveTransaction
    accounts={[
      {
        address: text('Address', ADDRESS),
        index: dummyAccounts.length + 1,
        balance: asWei(0),
        tokens: {},
      },
      ...dummyAccounts,
    ]}
    onCancel={action('receive-transaction-cancelled')}
    onGenerateNew={asyncAction('generate-new')}
    visible
  />
)

export const receiveTransactionEmptyModal = (): JSX.Element => (
  <ReceiveTransaction
    accounts={[{address: text('Address', ADDRESS), index: 0, balance: asWei(0), tokens: {}}]}
    onCancel={action('receive-transaction-cancelled')}
    onGenerateNew={asyncAction('generate-new')}
    visible
  />
)
