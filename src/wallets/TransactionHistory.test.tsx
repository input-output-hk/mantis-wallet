import '@testing-library/jest-dom/extend-expect'
import _ from 'lodash/fp'
import React, {FunctionComponent, useState} from 'react'
import {render, RenderResult, waitFor, act, fireEvent} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import BigNumber from 'bignumber.js'
import Web3 from 'web3'
import {TransactionHistory, TransactionHistoryProps} from './TransactionHistory'
import {PrivateAddress, WalletState, WalletStatus, FeeEstimates} from '../common/wallet-state'
import {SettingsState} from '../settings-state'
import {abbreviateAmountForEnUS} from '../common/test-helpers'
import {toHex, toWei, fromWei} from '../common/util'
import {BackendState} from '../common/backend-state'
import {ADDRESS} from '../storybook-util/dummies'
import {mockedCopyToClipboard} from '../jest.setup'
import {ExtendedTransaction} from './TransactionRow'

const web3 = new Web3()

const tx1: ExtendedTransaction = {
  hash: '1',
  txDirection: 'incoming',
  txStatus: {
    status: 'confirmed',
    atBlock: '0x1',
    timestamp: 1584527520,
  },
  txValue: toWei('123'),
  txDetails: {
    txType: 'transfer',
    memo: null,
  },
}

const tx2: ExtendedTransaction = {
  hash: '2',
  txDirection: 'outgoing',
  txStatus: 'pending',
  txValue: {
    value: toWei('123456789'),
    fee: toWei('100'),
  },
  txDetails: {
    txType: 'call',
    usedTransparentAccountIndexes: [0],
    transparentTransactionHash: 'transparentTransactionHash',
    transparentTransaction: {
      nonce: toHex(12345),
      gasPrice: 12345,
      gasLimit: toHex(12345),
      receivingAddress: 'receivingAddress',
      sendingAddress: 'sendingAddress',
      value: toHex(12345),
      payload: toHex(12345),
    },
    callTxStatus: {
      status: 'TransactionOk',
      message: '',
    },
  },
}

const addresses = [
  {
    address: ADDRESS,
    index: 0,
  },
  {
    address: 'private-address-1',
    index: 1,
  },
  {
    address: 'private-address-2',
    index: 2,
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
        <WalletState.Provider initialState={initialState}>{children}</WalletState.Provider>
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

const defaultProps: TransactionHistoryProps = {
  transactions: [],
  addresses: addresses,
  availableBalance: toWei(new BigNumber(1234)),
  sendTransaction: jest.fn(),
  estimateTransactionFee: estimateFees,
  generateAddress: jest.fn(),
}

const renderTransactionHistory = (props: Partial<TransactionHistoryProps> = {}): RenderResult => {
  const usedProps = {
    ...defaultProps,
    ...props,
  }

  return render(<TransactionHistory {...usedProps} />, {wrapper: WithProviders})
}

const TxHistoryWithAddressGenerator = ({
  preparedAddresses,
}: {
  preparedAddresses: PrivateAddress[]
}): JSX.Element => {
  const [counter, setCounter] = useState(1)

  const addresses = preparedAddresses.slice(-counter)

  return (
    <>
      <TransactionHistory
        {...defaultProps}
        addresses={addresses}
        generateAddress={(): Promise<void> => {
          setCounter(counter + 1)
          return Promise.resolve()
        }}
      />
    </>
  )
}

const renderTxHistoryWithAddressGenerator = (
  preparedAddresses: PrivateAddress[] = [],
): RenderResult =>
  render(<TxHistoryWithAddressGenerator preparedAddresses={preparedAddresses} />, {
    wrapper: WithProviders,
  })

test('TransactionHistory shows proper message with empty tx list', () => {
  const {getByText} = renderTransactionHistory()
  expect(getByText("You haven't made a transaction")).toBeInTheDocument()
})

// txAmount
test('TransactionHistory shows proper tx amounts', () => {
  const {getByText} = renderTransactionHistory({transactions: [tx1, tx2]})
  const {strict: formattedNumber1} = abbreviateAmountForEnUS(new BigNumber(123))
  expect(getByText(`+${formattedNumber1}`)).toBeInTheDocument()
  const {strict: formattedNumber2} = abbreviateAmountForEnUS(new BigNumber(123456889))
  expect(getByText(`-${formattedNumber2}`)).toBeInTheDocument()
})

// txStatus.status
test('TransactionHistory shows `Confirmed` status/icon', () => {
  const {getByText} = renderTransactionHistory({transactions: [tx1]})
  expect(getByText('Confirmed')).toBeInTheDocument()
})

test('TransactionHistory shows `Pending` status', () => {
  const {getByText} = renderTransactionHistory({transactions: [tx2]})
  expect(getByText('Pending')).toBeInTheDocument()
})

// txDirection
test('TransactionHistory shows `Incoming` tx text', () => {
  const {getByText} = renderTransactionHistory({transactions: [tx1]})
  expect(getByText('Received Confidential')).toBeInTheDocument()
})

test('TransactionHistory shows `Outgoing` tx text', () => {
  const {getByText} = renderTransactionHistory({transactions: [tx2]})
  expect(getByText('Sent Transparent')).toBeInTheDocument()
})

// Transparent/Confidential
test('TransactionHistory shows `Confidential` tx icon', () => {
  const {getByTitle} = renderTransactionHistory({transactions: [tx1]})
  expect(getByTitle('Confidential')).toBeInTheDocument()
})

test('TransactionHistory shows `Transparent` tx icon', () => {
  const {getByTitle} = renderTransactionHistory({transactions: [tx2]})
  expect(getByTitle('Transparent')).toBeInTheDocument()
})

// Modals
test('Send modal shows up', async () => {
  const availableEther = new BigNumber(123)

  const {getByTestId, getAllByText, getByText, queryByText} = renderTransactionHistory({
    availableBalance: toWei(availableEther),
  })
  const sendButton = getByTestId('send-button')
  await act(async () => userEvent.click(sendButton))

  // Default title is 'Send Transaction'
  expect(getByText('Send Transaction')).toBeInTheDocument()

  // Fee estimates are shown
  expect(getByText('Fee')).toBeInTheDocument()
  await waitFor(() => expect(queryByText('Slow')).toBeInTheDocument())
  await waitFor(() => expect(queryByText('Average')).toBeInTheDocument())
  await waitFor(() => expect(queryByText('Fast')).toBeInTheDocument())
  await waitFor(() => expect(queryByText('Custom')).toBeInTheDocument())

  // 'Recipient' and 'Amount' fields are two times in the document
  expect(getByText('Recipient')).toBeInTheDocument()
  expect(getByText('Amount')).toBeInTheDocument()

  // Send button appeared (plus the one in TxHistory)
  expect(getAllByText(/Send.*/)).toHaveLength(3)
})

test('Send transaction works', async () => {
  const availableEther = new BigNumber(1230)
  const usedEther = new BigNumber(951)
  const usedWei = toWei(usedEther)

  const baseEstimates = {
    low: new BigNumber(1230000000000),
    medium: new BigNumber(4560000000000),
    high: new BigNumber(7890000000000),
  }
  const mockEstimateCalculator = (amount: BigNumber) => (base: BigNumber): BigNumber =>
    base.plus(amount.dividedBy(1e7))
  const estimateFees = (amount: BigNumber): Promise<FeeEstimates> =>
    Promise.resolve(_.mapValues(mockEstimateCalculator(amount))(baseEstimates) as FeeEstimates)

  const send = jest.fn()

  const {
    getByTestId,
    getByLabelText,
    getAllByText,
    queryByText,
    queryAllByText,
  } = renderTransactionHistory({
    availableBalance: toWei(availableEther),
    estimateTransactionFee: estimateFees,
    sendTransaction: send,
  })
  const openSendModalButton = getByTestId('send-button')
  await act(async () => userEvent.click(openSendModalButton))

  // Set recipient to a invalid address, error pops up
  const recipient = getByLabelText('Recipient')
  fireEvent.change(recipient, {target: {value: 'not-an-address'}})
  await waitFor(() => expect(queryByText('Invalid address')).toBeInTheDocument())

  // Clear recipient, error message changes
  act(() => userEvent.clear(recipient))
  await waitFor(() => expect(recipient).toHaveAttribute('value', ''))
  await waitFor(() => expect(queryByText('Invalid address')).not.toBeInTheDocument())
  await waitFor(() => expect(queryByText('Recipient must be set')).toBeInTheDocument())

  // Set recipient to a valid address
  fireEvent.change(recipient, {target: {value: ADDRESS}})
  await waitFor(() => expect(queryByText('Recipient must be set')).not.toBeInTheDocument())

  // Check correct fee estimates are shown for default (0) amount
  await waitFor(() => expect(queryByText('0.00000123', {exact: false})).toBeInTheDocument())
  await waitFor(() => expect(queryAllByText('0.00000456', {exact: false})).toHaveLength(2)) // Medium is used for total amount
  await waitFor(() => expect(queryByText('0.00000789', {exact: false})).toBeInTheDocument())

  // Amount should be set to 0 by default
  const amount = getByLabelText('Amount')
  expect(amount).toHaveAttribute('value', '0')

  // Clear amount, error pops up
  await act(async () => userEvent.clear(amount))
  await waitFor(() => expect(queryByText('Must be a number greater than 0')).toBeInTheDocument())

  // Set amount to too high value, error changes
  fireEvent.change(amount, {target: {value: `${usedEther.toString(10)}0`}})
  await waitFor(() =>
    expect(queryByText('Must be a number greater than 0')).not.toBeInTheDocument(),
  )
  await waitFor(() => expect(queryByText('Insufficient funds')).toBeInTheDocument())

  // Set amount to correct value by deleting last digit, error disappears
  await act(() => userEvent.type(amount, '{backspace}'))
  await waitFor(() => expect(queryByText('Insufficient funds')).not.toBeInTheDocument())

  // Check correct fee estimates are shown for default used amount
  await waitFor(() => {
    Object.values(baseEstimates).forEach((estimate) => {
      const {strict: estimateFormatted} = abbreviateAmountForEnUS(
        fromWei(mockEstimateCalculator(usedWei)(estimate)),
      )
      expect(queryByText(estimateFormatted, {exact: false})).toBeInTheDocument()
    })
  })

  // Choose slow fee
  const slowFeeEstimate = getAllByText('Slow')[0]
  await act(async () => userEvent.click(slowFeeEstimate))

  // Click correct send button and check if it was called with correct params
  const sendButton = getAllByText(/Send.*/)[2]
  await act(async () => userEvent.click(sendButton))
  await waitFor(() =>
    expect(send).toBeCalledWith(
      ADDRESS, // the address used
      usedWei.toNumber(), // the amount used
      mockEstimateCalculator(usedWei)(baseEstimates.low).toNumber(), // the lowest fee used
      '',
    ),
  )
})

test('Receive modal shows up with address', async () => {
  const {getByTestId, getByText} = renderTransactionHistory({addresses: addresses})
  const receiveButton = getByTestId('receive-button')
  userEvent.click(receiveButton)

  // Title is visible
  expect(getByText('Your Address')).toBeInTheDocument()

  // Address and QR code is visible
  expect(getByText(ADDRESS)).toBeInTheDocument()
  expect(getByTestId('qr-code')).toBeInTheDocument()

  // Address can be copied
  const copyAddressButton = getByText('Copy Address')
  act(() => userEvent.click(copyAddressButton))
  await waitFor(() => expect(mockedCopyToClipboard).toBeCalledWith(ADDRESS, expect.any(String)))
  expect(mockedCopyToClipboard).toHaveBeenCalledTimes(1)
})

test('Receive modal works with multiple addresses', async () => {
  const getAddress = (index: number): string => addresses[addresses.length - 1 - index].address

  const {getByTestId, getByText, queryByText} = renderTxHistoryWithAddressGenerator(addresses)
  const receiveButton = getByTestId('receive-button')
  userEvent.click(receiveButton)

  // One can generate a new address
  await waitFor(() => expect(getByText(getAddress(0))).toBeInTheDocument())
  await waitFor(() => expect(queryByText(getAddress(1))).not.toBeInTheDocument())

  const generateNewButton = getByText('Generate New', {exact: false})
  act(() => userEvent.click(generateNewButton))
  await waitFor(() => expect(getByText(getAddress(1))).toBeInTheDocument())

  // QR code is also visible and address can be copied
  expect(getByTestId('qr-code')).toBeInTheDocument()
  const copyAddressButton = getByText('Copy Address')
  act(() => userEvent.click(copyAddressButton))
  await waitFor(() =>
    expect(mockedCopyToClipboard).toBeCalledWith(getAddress(1), expect.any(String)),
  )

  // Generate 1 more address
  act(() => userEvent.click(generateNewButton))
  await waitFor(() => expect(getByText(getAddress(1))).toBeInTheDocument())
})
