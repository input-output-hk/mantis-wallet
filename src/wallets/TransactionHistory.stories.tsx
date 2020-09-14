import React from 'react'
import BigNumber from 'bignumber.js'
import _ from 'lodash/fp'
import {action} from '@storybook/addon-actions'
import {object, text} from '@storybook/addon-knobs'
import {ESSENTIAL_DECORATORS} from '../storybook-util/essential-decorators'
import {toHex} from '../common/util'
import {withWalletState} from '../storybook-util/wallet-state-decorator'
import {withBuildJobState} from '../storybook-util/build-job-state-decorator'
import {ether, asyncAction} from '../storybook-util/custom-knobs'
import {dummyTransactions, estimateFeesWithRandomDelay, ADDRESS} from '../storybook-util/dummies'
import {SendTransaction} from './modals/SendTransaction'
import {ReceiveTransaction} from './modals/ReceiveTransaction'
import {TransactionHistory} from './TransactionHistory'
import {ExtendedTransaction} from './TransactionRow'

export default {
  title: 'Transaction History',
  decorators: [...ESSENTIAL_DECORATORS, withWalletState, withBuildJobState],
}

const addresses = _.range(0, 20).map((index) => ({
  index,
  address: `address-${index}`,
}))

export const withNoTransactions = (): JSX.Element => (
  <TransactionHistory
    transactions={[]}
    addresses={addresses}
    availableBalance={new BigNumber(0)}
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
        object<ExtendedTransaction>('Transaction 1', {
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
            memo: null,
          },
        }),
        object<ExtendedTransaction>('Transaction 2', {
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
            memo: null,
          },
        }),
        object<ExtendedTransaction>('Transaction 3', {
          hash: '3',
          txDirection: 'incoming',
          txValue: toHex(1000.0),
          txStatus: 'pending',
          txDetails: {
            txType: 'transfer',
            memo: null,
          },
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
