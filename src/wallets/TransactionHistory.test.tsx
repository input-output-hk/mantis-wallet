import '@testing-library/jest-dom/extend-expect'
import React, {FunctionComponent} from 'react'
import {render, RenderResult} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {TransactionHistory} from './TransactionHistory'
import {Transaction} from '../web3'
import {WalletState} from '../common/wallet-state'

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
  },
  txValue: '123',
  txDetails: {
    txType: 'transfer',
  },
}

const tx2: Transaction = {
  hash: '2',
  txDirection: 'outgoing',
  txStatus: 'pending',
  txValue: '123456789',
  txDetails: {
    txType: 'call',
  },
}

const WithProviders: FunctionComponent = ({children}: {children?: React.ReactNode}) => {
  return <WalletState.Provider>{children}</WalletState.Provider>
}

const wrappedRender = (ui: React.ReactElement): RenderResult => render(ui, {wrapper: WithProviders})

test('TransactionHistory shows proper message with empty tx list', () => {
  const {getByText} = wrappedRender(
    <TransactionHistory transactions={[]} transparentAddresses={[]} accounts={[]} />,
  )
  expect(getByText("You haven't made a transaction")).toBeInTheDocument()
})

// txAmount
test('TransactionHistory shows proper tx amounts', () => {
  const {getByText} = wrappedRender(
    <TransactionHistory transactions={[tx1, tx2]} transparentAddresses={[]} accounts={[]} />,
  )
  expect(getByText('123')).toBeInTheDocument()
  expect(getByText('123.457M')).toBeInTheDocument()
})

// txStatus.status
test('TransactionHistory shows `Confirmed` status/icon', () => {
  const {getByTitle} = wrappedRender(
    <TransactionHistory transactions={[tx1]} transparentAddresses={[]} accounts={[]} />,
  )
  expect(getByTitle('Confirmed')).toBeInTheDocument()
})

test('TransactionHistory shows `Pending` status', () => {
  const {getByText} = wrappedRender(
    <TransactionHistory transactions={[tx2]} transparentAddresses={[]} accounts={[]} />,
  )
  expect(getByText('Pending')).toBeInTheDocument()
})

// txDirection
test('TransactionHistory shows `Incoming` tx icon', () => {
  const {getByTitle} = wrappedRender(
    <TransactionHistory transactions={[tx1]} transparentAddresses={[]} accounts={[]} />,
  )
  expect(getByTitle('Incoming')).toBeInTheDocument()
})

test('TransactionHistory shows `Outgoing` tx icon', () => {
  const {getByTitle} = wrappedRender(
    <TransactionHistory transactions={[tx2]} transparentAddresses={[]} accounts={[]} />,
  )
  expect(getByTitle('Outgoing')).toBeInTheDocument()
})

// Transparent/Confidential
test('TransactionHistory shows `Confidential` tx icon', () => {
  const {getByTitle} = wrappedRender(
    <TransactionHistory transactions={[tx1]} transparentAddresses={[]} accounts={[]} />,
  )
  expect(getByTitle('Confidential')).toBeInTheDocument()
})

test('TransactionHistory shows `Transparent` tx icon', () => {
  const {getByTitle} = wrappedRender(
    <TransactionHistory transactions={[tx2]} transparentAddresses={[]} accounts={[]} />,
  )
  expect(getByTitle('Transparent')).toBeInTheDocument()
})

// Modals
test('Send modal shows up', () => {
  const {getByTestId, getByText} = wrappedRender(
    <TransactionHistory transactions={[tx1, tx2]} transparentAddresses={[]} accounts={[]} />,
  )
  const sendButton = getByTestId('send-button')
  expect(sendButton).toBeInTheDocument()
  userEvent.click(sendButton)

  expect(getByText('Recipient')).toBeInTheDocument()
})

test('Receive modal shows up', () => {
  const {getByTestId, getByText} = wrappedRender(
    <TransactionHistory transactions={[tx1, tx2]} transparentAddresses={[]} accounts={[]} />,
  )
  const receiveButton = getByTestId('receive-button')
  expect(receiveButton).toBeInTheDocument()
  userEvent.click(receiveButton)

  expect(getByText('No known addresses')).toBeInTheDocument()
})
