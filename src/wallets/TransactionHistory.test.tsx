import '@testing-library/jest-dom/extend-expect'
import React, {FunctionComponent} from 'react'
import {render, RenderResult} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import BigNumber from 'bignumber.js'
import {TransactionHistory} from './TransactionHistory'
import {Transaction, Account, makeWeb3Worker} from '../web3'
import {mockWeb3Worker} from '../web3-mock'
import {WalletState, WalletStatus} from '../common/wallet-state'
import {ThemeState} from '../theme-state'
import {abbreviateAmount} from '../common/formatters'
import {toHex} from '../common/util'
import {UNITS} from '../common/units'

const {Dust} = UNITS

const web3 = makeWeb3Worker(mockWeb3Worker)

jest.mock('react-inlinesvg', () => {
  return function SVG(props: {title: string}): JSX.Element {
    return (
      <svg xmlns="http://www.w3.org/2000/svg">
        <title>{props.title}</title>
      </svg>
    )
  }
})
jest.mock('../config/renderer.ts')

const tx1: Transaction = {
  hash: '1',
  txDirection: 'incoming',
  txStatus: {
    status: 'confirmed',
    atBlock: '0x1',
    timestamp: 1584527520,
  },
  txValue: Dust.toBasic('123'),
  txDetails: {
    txType: 'transfer',
  },
}

const tx2: Transaction = {
  hash: '2',
  txDirection: 'outgoing',
  txStatus: 'pending',
  txValue: {
    value: Dust.toBasic('123456789'),
    fee: Dust.toBasic('100'),
  },
  txDetails: {
    txType: 'call',
    usedTransparentAccountIndex: 0,
    transparentTransactionHash: 'transparentTransactionHash',
    transparentTransaction: {
      nonce: toHex(12345),
      gasPrice: toHex(12345),
      gasLimit: toHex(12345),
      receivingAddress: 'receivingAddress',
      sendingAddress: 'sendingAddress',
      value: toHex(12345),
      payload: toHex(12345),
    },
  },
}

const accounts: Account[] = [
  {
    wallet: 'test-wallet',
    address: 'test-address',
    locked: false,
  },
]

const WithProviders: FunctionComponent = ({children}: {children?: React.ReactNode}) => {
  const initialState = {
    walletStatus: 'LOADED' as WalletStatus,
    web3,
  }

  return (
    <ThemeState.Provider>
      <WalletState.Provider initialState={initialState}>{children}</WalletState.Provider>
    </ThemeState.Provider>
  )
}

const wrappedRender = (ui: React.ReactElement): RenderResult => render(ui, {wrapper: WithProviders})

test('TransactionHistory shows proper message with empty tx list', () => {
  const {getByText} = wrappedRender(
    <TransactionHistory transactions={[]} transparentAddresses={[]} accounts={accounts} />,
  )
  expect(getByText("You haven't made a transaction")).toBeInTheDocument()
})

// txAmount
test('TransactionHistory shows proper tx amounts', () => {
  const {getByText} = wrappedRender(
    <TransactionHistory transactions={[tx1, tx2]} transparentAddresses={[]} accounts={accounts} />,
  )
  const {strict: formattedNumber1} = abbreviateAmount(new BigNumber(123))
  expect(getByText(formattedNumber1)).toBeInTheDocument()
  const {strict: formattedNumber2} = abbreviateAmount(new BigNumber(123456789))
  expect(getByText(formattedNumber2)).toBeInTheDocument()
})

// txStatus.status
test('TransactionHistory shows `Confirmed` status/icon', () => {
  const {getByTitle} = wrappedRender(
    <TransactionHistory transactions={[tx1]} transparentAddresses={[]} accounts={accounts} />,
  )
  expect(getByTitle('Confirmed')).toBeInTheDocument()
})

test('TransactionHistory shows `Pending` status', () => {
  const {getByText} = wrappedRender(
    <TransactionHistory transactions={[tx2]} transparentAddresses={[]} accounts={accounts} />,
  )
  expect(getByText('Pending')).toBeInTheDocument()
})

// txDirection
test('TransactionHistory shows `Incoming` tx icon', () => {
  const {getByTitle} = wrappedRender(
    <TransactionHistory transactions={[tx1]} transparentAddresses={[]} accounts={accounts} />,
  )
  expect(getByTitle('Incoming')).toBeInTheDocument()
})

test('TransactionHistory shows `Outgoing` tx icon', () => {
  const {getByTitle} = wrappedRender(
    <TransactionHistory transactions={[tx2]} transparentAddresses={[]} accounts={accounts} />,
  )
  expect(getByTitle('Outgoing')).toBeInTheDocument()
})

// Transparent/Confidential
test('TransactionHistory shows `Confidential` tx icon', () => {
  const {getByTitle} = wrappedRender(
    <TransactionHistory transactions={[tx1]} transparentAddresses={[]} accounts={accounts} />,
  )
  expect(getByTitle('Confidential')).toBeInTheDocument()
})

test('TransactionHistory shows `Transparent` tx icon', () => {
  const {getByTitle} = wrappedRender(
    <TransactionHistory transactions={[tx2]} transparentAddresses={[]} accounts={accounts} />,
  )
  expect(getByTitle('Transparent')).toBeInTheDocument()
})

// Modals
test('Send modal shows up', () => {
  const {getByTestId, getByText} = wrappedRender(
    <TransactionHistory transactions={[tx1, tx2]} transparentAddresses={[]} accounts={accounts} />,
  )
  const sendButton = getByTestId('send-button')
  expect(sendButton).toBeInTheDocument()
  userEvent.click(sendButton)

  expect(getByText('Recipient')).toBeInTheDocument()
})

test('Receive modal shows up', () => {
  const {getByTestId, getByText} = wrappedRender(
    <TransactionHistory transactions={[tx1, tx2]} transparentAddresses={[]} accounts={accounts} />,
  )
  const receiveButton = getByTestId('receive-button')
  expect(receiveButton).toBeInTheDocument()
  userEvent.click(receiveButton)

  expect(getByText('Your private address')).toBeInTheDocument()
})
