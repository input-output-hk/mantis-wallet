import React from 'react'
import _ from 'lodash/fp'
import {action} from '@storybook/addon-actions'
import {text, object} from '@storybook/addon-knobs'
import {ESSENTIAL_DECORATORS} from '../storybook-util/essential-decorators'
import {ether, asyncAction} from '../storybook-util/custom-knobs'
import {estimateFeesWithRandomDelay, ADDRESS, dummyTransactions} from '../storybook-util/dummies'
import {SendTransaction} from './modals/SendTransaction'
import {ReceiveTransaction} from './modals/ReceiveTransaction'
import {TransactionHistory} from './TransactionHistory'
import {asWei, asEther} from '../common/units'
import {Transaction} from '../common/wallet-state'

export default {
  title: 'Transaction History',
  decorators: ESSENTIAL_DECORATORS,
}

const addresses = _.range(0, 20).map((index) => ({
  index,
  address: `address-${index}`,
}))

export const withNoTransactions = (): JSX.Element => (
  <TransactionHistory
    transactions={[]}
    addresses={addresses}
    availableBalance={asWei(0)}
    sendTransaction={asyncAction('on-send-transaction')}
    estimateTransactionFee={estimateFeesWithRandomDelay}
    generateAddress={asyncAction('on-generate-address')}
  />
)

export const withDemoTransactions = (): JSX.Element => (
  <TransactionHistory
    transactions={dummyTransactions}
    addresses={addresses}
    availableBalance={ether('Available Balance', 1000)}
    sendTransaction={asyncAction('on-send-transaction')}
    estimateTransactionFee={estimateFeesWithRandomDelay}
    generateAddress={asyncAction('on-generate-address')}
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
          status: 'persisted',
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
        }),
      ]}
      addresses={addresses}
      availableBalance={ether('Available Balance', 1000)}
      sendTransaction={asyncAction('on-send-transaction')}
      estimateTransactionFee={estimateFeesWithRandomDelay}
      generateAddress={asyncAction('on-generate-address')}
    />
  )
}

export const sendTransaction = (): JSX.Element => (
  <SendTransaction
    availableAmount={ether('Available Amount', 123.456)}
    onCancel={action('send-transaction-cancelled')}
    onSend={asyncAction('on-send')}
    estimateTransactionFee={estimateFeesWithRandomDelay}
    visible
  />
)

export const receiveTransaction = (): JSX.Element => (
  <ReceiveTransaction
    addresses={[{address: text('Address', ADDRESS), index: 1}, ...addresses]}
    onCancel={action('receive-transaction-cancelled')}
    onGenerateNew={asyncAction('generate-new')}
    visible
  />
)

export const receiveTransactionEmptyModal = (): JSX.Element => (
  <ReceiveTransaction
    addresses={[{address: text('Address', ADDRESS), index: 0}]}
    onCancel={action('receive-transaction-cancelled')}
    onGenerateNew={asyncAction('generate-new')}
    visible
  />
)
