import '@testing-library/jest-dom/extend-expect'
import React, {FunctionComponent} from 'react'
import {render, RenderResult, waitFor} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import BigNumber from 'bignumber.js'
import {TransactionHistory} from './TransactionHistory'
import {Transaction, Account, makeWeb3Worker} from '../web3'
import {mockWeb3Worker} from '../web3-mock'
import {WalletState, WalletStatus, FeeEstimates} from '../common/wallet-state'
import {BuildJobState} from '../common/build-job-state'
import {SettingsState} from '../settings-state'
import {abbreviateAmount} from '../common/formatters'
import {toHex} from '../common/util'
import {UNITS} from '../common/units'
import {BackendState} from '../common/backend-state'

const {Dust} = UNITS

const web3 = makeWeb3Worker(mockWeb3Worker)

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
    usedTransparentAccountIndexes: [0],
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
    <SettingsState.Provider>
      <BackendState.Provider initialState={{web3}}>
        <BuildJobState.Provider initialState={{web3}}>
          <WalletState.Provider initialState={initialState}>{children}</WalletState.Provider>
        </BuildJobState.Provider>
      </BackendState.Provider>
    </SettingsState.Provider>
  )
}

const estimateFees = (): Promise<FeeEstimates> =>
  Promise.resolve({
    low: new BigNumber(100),
    medium: new BigNumber(200),
    high: new BigNumber(300),
  })

const renderTransactionHistory = (
  transactions: Transaction[],
): RenderResult & {goToAccounts: ReturnType<typeof jest.fn>} => {
  const goToAccounts = jest.fn()
  return {
    goToAccounts,
    ...render(
      <TransactionHistory
        transactions={transactions}
        transparentAddresses={[
          {
            address: 'transparent-address',
            index: 0,
          },
        ]}
        accounts={accounts}
        availableBalance={new BigNumber(1000)}
        sendTransaction={jest.fn()}
        sendTxToTransparent={jest.fn()}
        estimateGasPrice={estimateFees}
        estimateTransactionFee={estimateFees}
        estimatePublicTransactionFee={estimateFees}
        generateAddress={jest.fn()}
        goToAccounts={goToAccounts}
      />,
      {wrapper: WithProviders},
    ),
  }
}

test('TransactionHistory shows proper message with empty tx list', () => {
  const {getByText} = renderTransactionHistory([])
  expect(getByText("You haven't made a transaction")).toBeInTheDocument()
})

// txAmount
test('TransactionHistory shows proper tx amounts', () => {
  const {getByText} = renderTransactionHistory([tx1, tx2])
  const {strict: formattedNumber1} = abbreviateAmount(new BigNumber(123))
  expect(getByText(`+${formattedNumber1}`)).toBeInTheDocument()
  const {strict: formattedNumber2} = abbreviateAmount(new BigNumber(123456889))
  expect(getByText(`-${formattedNumber2}`)).toBeInTheDocument()
})

// txStatus.status
test('TransactionHistory shows `Confirmed` status/icon', () => {
  const {getByTitle} = renderTransactionHistory([tx1])
  expect(getByTitle('Confirmed')).toBeInTheDocument()
})

test('TransactionHistory shows `Pending` status', () => {
  const {getByTitle} = renderTransactionHistory([tx2])
  expect(getByTitle('Pending')).toBeInTheDocument()
})

// txDirection
test('TransactionHistory shows `Incoming` tx text', () => {
  const {getByText} = renderTransactionHistory([tx1])
  expect(getByText('Received Confidential')).toBeInTheDocument()
})

test('TransactionHistory shows `Outgoing` tx text', () => {
  const {getByText} = renderTransactionHistory([tx2])
  expect(getByText('Sent Transparent')).toBeInTheDocument()
})

// Transparent/Confidential
test('TransactionHistory shows `Confidential` tx icon', () => {
  const {getByTitle} = renderTransactionHistory([tx1])
  expect(getByTitle('Confidential')).toBeInTheDocument()
})

test('TransactionHistory shows `Transparent` tx icon', () => {
  const {getByTitle} = renderTransactionHistory([tx2])
  expect(getByTitle('Transparent')).toBeInTheDocument()
})

// Modals
test('Send modal shows up', async () => {
  const {getByTestId, getAllByText} = renderTransactionHistory([tx1, tx2])
  const sendButton = getByTestId('send-button')
  userEvent.click(sendButton)

  await waitFor(() => expect(getAllByText('Recipient')).toHaveLength(2))
})

test('Receive modal shows up', () => {
  const {getByTestId, getByText} = renderTransactionHistory([tx1, tx2])
  const receiveButton = getByTestId('receive-button')
  userEvent.click(receiveButton)

  expect(getByText('Your private address')).toBeInTheDocument()
})

// Navigation
test('Should navigation to accounts', async () => {
  const {getByText, goToAccounts} = renderTransactionHistory([tx1, tx2])
  const transparentAccounts = getByText('Transparent Accounts')
  userEvent.click(transparentAccounts)

  expect(goToAccounts).toBeCalled()
})
