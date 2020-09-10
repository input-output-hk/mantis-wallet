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
import {
  dummyTransactions,
  estimateFeesWithRandomDelay,
  CONFIDENTIAL_ADDRESS,
  dummyTransparentAccounts,
} from '../storybook-util/dummies'
import {SendTransaction} from './modals/SendTransaction'
import {ReceiveTransaction} from './modals/ReceiveTransaction'
import {TransactionHistory} from './TransactionHistory'
import {ExtendedTransaction} from './TransactionRow'

export default {
  title: 'Transaction History',
  decorators: [...ESSENTIAL_DECORATORS, withWalletState, withBuildJobState],
}

const privateAddresses = _.range(0, 20).map((index) => ({
  index,
  address: `private-address-${index}`,
}))

export const withNoTransactions = (): JSX.Element => (
  <TransactionHistory
    transactions={[]}
    transparentAddresses={[]}
    privateAddresses={privateAddresses}
    availableBalance={new BigNumber(0)}
    sendTransaction={asyncAction('on-send-transaction')}
    sendTxToTransparent={asyncAction('on-send-tx-to-transparent')}
    estimateTransactionFee={estimateFeesWithRandomDelay}
    estimatePublicTransactionFee={estimateFeesWithRandomDelay}
    generateTransparentAddress={asyncAction('on-generate-transparent-address')}
    generatePrivateAddress={asyncAction('on-generate-private-address')}
  />
)

export const withDemoTransactions = (): JSX.Element => (
  <TransactionHistory
    transactions={dummyTransactions}
    transparentAddresses={[]}
    privateAddresses={privateAddresses}
    availableBalance={ether('Available Balance', 1000)}
    sendTransaction={asyncAction('on-send-transaction')}
    sendTxToTransparent={asyncAction('on-send-tx-to-transparent')}
    estimateTransactionFee={estimateFeesWithRandomDelay}
    estimatePublicTransactionFee={estimateFeesWithRandomDelay}
    generateTransparentAddress={asyncAction('on-generate-transparent-address')}
    generatePrivateAddress={asyncAction('on-generate-private-address')}
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
      privateAddresses={privateAddresses}
      availableBalance={ether('Available Balance', 1000)}
      sendTransaction={asyncAction('on-send-transaction')}
      sendTxToTransparent={asyncAction('on-send-tx-to-transparent')}
      estimateTransactionFee={estimateFeesWithRandomDelay}
      estimatePublicTransactionFee={estimateFeesWithRandomDelay}
      generateTransparentAddress={asyncAction('on-generate-transparent-address')}
      generatePrivateAddress={asyncAction('on-generate-private-address')}
    />
  )
}

export const sendConfidentialTransaction = (): JSX.Element => (
  <SendTransaction
    availableAmount={ether('Available Amount', 123.456)}
    onCancel={action('send-transaction-cancelled')}
    onSendToConfidential={asyncAction('on-send')}
    onSendToTransparent={asyncAction('on-send-to-transparent')}
    estimatePrivateTransactionFee={estimateFeesWithRandomDelay}
    estimatePublicTransactionFee={estimateFeesWithRandomDelay}
    defaultMode="confidential"
    visible
  />
)

export const sendTransparentTransaction = (): JSX.Element => (
  <SendTransaction
    availableAmount={ether('Available Amount', 123.456)}
    onCancel={action('send-transaction-cancelled')}
    onSendToConfidential={asyncAction('on-send')}
    onSendToTransparent={asyncAction('on-send-to-transparent')}
    estimatePrivateTransactionFee={estimateFeesWithRandomDelay}
    estimatePublicTransactionFee={estimateFeesWithRandomDelay}
    defaultMode="transparent"
    visible
  />
)

export const receiveConfidentialTransaction = (): JSX.Element => (
  <ReceiveTransaction
    transparentAddresses={[]}
    privateAddresses={[
      {address: text('Private address', CONFIDENTIAL_ADDRESS), index: 1},
      ...privateAddresses,
    ]}
    onCancel={action('receive-transaction-cancelled')}
    onGenerateNewTransparent={asyncAction('generate-new-transparent')}
    onGenerateNewPrivate={asyncAction('generate-new-private')}
    defaultMode="confidential"
    visible
  />
)

export const receiveTransparentTransaction = (): JSX.Element => (
  <ReceiveTransaction
    transparentAddresses={dummyTransparentAccounts}
    privateAddresses={[{address: text('Private address', CONFIDENTIAL_ADDRESS), index: 0}]}
    onCancel={action('receive-transaction-cancelled')}
    onGenerateNewTransparent={asyncAction('generate-new-transparent')}
    onGenerateNewPrivate={asyncAction('generate-new-private')}
    defaultMode="transparent"
    visible
  />
)

export const receiveTransparentTransactionEmptyModal = (): JSX.Element => (
  <ReceiveTransaction
    transparentAddresses={[]}
    privateAddresses={[{address: text('Private address', CONFIDENTIAL_ADDRESS), index: 0}]}
    onCancel={action('receive-transaction-cancelled')}
    onGenerateNewTransparent={asyncAction('generate-new-transparent')}
    onGenerateNewPrivate={asyncAction('generate-new-private')}
    defaultMode="transparent"
    visible
  />
)
