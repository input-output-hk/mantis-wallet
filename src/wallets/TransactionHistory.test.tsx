import '@testing-library/jest-dom/extend-expect'
import _ from 'lodash/fp'
import React, {FunctionComponent, useState} from 'react'
import {render, RenderResult, waitFor, act, fireEvent} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import BigNumber from 'bignumber.js'
import {TransactionHistory, TransactionHistoryProps} from './TransactionHistory'
import {makeWeb3Worker, TransparentAddress} from '../web3'
import {mockWeb3Worker} from '../web3-mock'
import {WalletState, WalletStatus, FeeEstimates} from '../common/wallet-state'
import {BuildJobState} from '../common/build-job-state'
import {SettingsState} from '../settings-state'
import {abbreviateAmountForEnUS} from '../common/test-helpers'
import {toHex} from '../common/util'
import {UNITS} from '../common/units'
import {BackendState} from '../common/backend-state'
import {CONFIDENTIAL_ADDRESS, dummyTransparentAccounts} from '../storybook-util/dummies'
import {mockedCopyToClipboard} from '../jest.setup'
import {ExtendedTransaction} from './TransactionRow'

const {Ether} = UNITS

const web3 = makeWeb3Worker(mockWeb3Worker)

const tx1: ExtendedTransaction = {
  hash: '1',
  txDirection: 'incoming',
  txStatus: {
    status: 'confirmed',
    atBlock: '0x1',
    timestamp: 1584527520,
  },
  txValue: Ether.toBasic('123'),
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
    value: Ether.toBasic('123456789'),
    fee: Ether.toBasic('100'),
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

const transparentAddresses = [
  {
    address: 'transparent-address',
    index: 0,
  },
]

const privateAddresses = [
  {
    address: CONFIDENTIAL_ADDRESS,
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

const defaultProps: TransactionHistoryProps = {
  transactions: [],
  transparentAddresses: transparentAddresses,
  privateAddresses: privateAddresses,
  availableBalance: Ether.toBasic(new BigNumber(1234)),
  sendTransaction: jest.fn(),
  sendTxToTransparent: jest.fn(),
  estimateTransactionFee: estimateFees,
  estimatePublicTransactionFee: estimateFees,
  generateTransparentAddress: jest.fn(),
  generatePrivateAddress: jest.fn(),
}

const renderTransactionHistory = (props: Partial<TransactionHistoryProps> = {}): RenderResult => {
  const usedProps = {
    ...defaultProps,
    ...props,
  }

  return render(<TransactionHistory {...usedProps} />, {wrapper: WithProviders})
}

const TxHistoryWithTransparentAddressGenerator = ({
  preparedTransparentAddresses,
}: {
  preparedTransparentAddresses: TransparentAddress[]
}): JSX.Element => {
  const [counter, setCounter] = useState(0)

  const transparentAddresses = counter === 0 ? [] : preparedTransparentAddresses.slice(-counter)

  return (
    <>
      <TransactionHistory
        {...defaultProps}
        transparentAddresses={transparentAddresses}
        generateTransparentAddress={(): Promise<void> => {
          setCounter(counter + 1)
          return Promise.resolve()
        }}
      />
    </>
  )
}

const renderTxHistoryWithTransparentAddressGenerator = (
  preparedTransparentAddresses: TransparentAddress[] = [],
): RenderResult =>
  render(
    <TxHistoryWithTransparentAddressGenerator
      preparedTransparentAddresses={preparedTransparentAddresses}
    />,
    {
      wrapper: WithProviders,
    },
  )

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
    availableBalance: Ether.toBasic(availableEther),
  })
  const sendButton = getByTestId('send-button')
  await act(async () => userEvent.click(sendButton))

  // Default title is 'Confidential → Confidential'
  expect(getByText('Confidential → Confidential')).toBeInTheDocument()

  // Fee estimates are shown
  expect(getByText('Fee')).toBeInTheDocument()
  await waitFor(() => expect(queryByText('Slow')).toBeInTheDocument())
  await waitFor(() => expect(queryByText('Average')).toBeInTheDocument())
  await waitFor(() => expect(queryByText('Fast')).toBeInTheDocument())
  await waitFor(() => expect(queryByText('Custom')).toBeInTheDocument())

  // 'Tx type' field and its buttons are in the document
  expect(getByText('Transaction Type')).toBeInTheDocument()
  expect(getByText('Confidential')).toBeInTheDocument()
  expect(getByText('Transparent')).toBeInTheDocument()

  // 'Recipient' and 'Amount' fields are two times in the document
  expect(getByText('Recipient')).toBeInTheDocument()
  expect(getByText('Amount')).toBeInTheDocument()

  // Two Send buttons appeared (plus the one in TxHistory)
  expect(getAllByText(/Send.*/)).toHaveLength(2)
})

test('Send confidential transaction works', async () => {
  const availableEther = new BigNumber(1230)
  const usedEther = new BigNumber(951)
  const usedWei = Ether.toBasic(usedEther)

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
    availableBalance: Ether.toBasic(availableEther),
    estimateTransactionFee: estimateFees,
    sendTransaction: send,
  })
  const openSendModalButton = getByTestId('send-button')
  await act(async () => userEvent.click(openSendModalButton))

  // Set recipient to a invalid address, error pops up
  const confidentialRecipient = getByLabelText('Recipient')
  fireEvent.change(confidentialRecipient, {target: {value: 'not-an-address'}})
  await waitFor(() => expect(queryByText('Invalid confidential address')).toBeInTheDocument())

  // Clear recipient, error message changes
  act(() => userEvent.clear(confidentialRecipient))
  await waitFor(() => expect(confidentialRecipient).toHaveAttribute('value', ''))
  await waitFor(() => expect(queryByText('Invalid confidential address')).not.toBeInTheDocument())
  await waitFor(() => expect(queryByText('Recipient must be set')).toBeInTheDocument())

  // Set recipient to a valid address
  fireEvent.change(confidentialRecipient, {target: {value: CONFIDENTIAL_ADDRESS}})
  await waitFor(() => expect(queryByText('Recipient must be set')).not.toBeInTheDocument())

  // Check correct fee estimates are shown for default (0) amount
  await waitFor(() => expect(queryByText('0.00000123', {exact: false})).toBeInTheDocument())
  await waitFor(() => expect(queryAllByText('0.00000456', {exact: false})).toHaveLength(2)) // Medium is used for total amount
  await waitFor(() => expect(queryByText('0.00000789', {exact: false})).toBeInTheDocument())

  // Amount should be set to 0 by default
  const confidentialAmount = getByLabelText('Amount')
  expect(confidentialAmount).toHaveAttribute('value', '0')

  // Clear amount, error pops up
  await act(async () => userEvent.clear(confidentialAmount))
  await waitFor(() => expect(queryByText('Must be a number greater than 0')).toBeInTheDocument())

  // Set amount to too high value, error changes
  fireEvent.change(confidentialAmount, {target: {value: `${usedEther.toString(10)}0`}})
  await waitFor(() =>
    expect(queryByText('Must be a number greater than 0')).not.toBeInTheDocument(),
  )
  await waitFor(() => expect(queryByText('Insufficient funds')).toBeInTheDocument())

  // Set amount to correct value by deleting last digit, error disappears
  await act(() => userEvent.type(confidentialAmount, '{backspace}'))
  await waitFor(() => expect(queryByText('Insufficient funds')).not.toBeInTheDocument())

  // Check correct fee estimates are shown for default used amount
  await waitFor(() => {
    Object.values(baseEstimates).forEach((estimate) => {
      const {strict: estimateFormatted} = abbreviateAmountForEnUS(
        Ether.fromBasic(mockEstimateCalculator(usedWei)(estimate)),
      )
      expect(queryByText(estimateFormatted, {exact: false})).toBeInTheDocument()
    })
  })

  // Choose slow fee
  const slowConfidentialFeeEstimate = getAllByText('Slow')[0]
  await act(async () => userEvent.click(slowConfidentialFeeEstimate))

  // Click correct send button and check if it was called with correct params
  const sendButton = getAllByText(/Send.*/)[1]
  await act(async () => userEvent.click(sendButton))
  await waitFor(() =>
    expect(send).toBeCalledWith(
      CONFIDENTIAL_ADDRESS, // the confidential address used
      usedWei.toNumber(), // the amount used
      mockEstimateCalculator(usedWei)(baseEstimates.low).toNumber(), // the lowest fee used
      '',
    ),
  )
})

test('Send transparent transaction works', async () => {
  const availableEther = new BigNumber(1230)
  const usedEther = new BigNumber(951)
  const usedWei = Ether.toBasic(usedEther)
  const recipient = dummyTransparentAccounts[0].address

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
    getAllByText,
    getByText,
    queryByText,
    getByLabelText,
    queryAllByText,
  } = renderTransactionHistory({
    availableBalance: Ether.toBasic(availableEther),
    estimatePublicTransactionFee: estimateFees,
    sendTxToTransparent: send,
  })
  const openSendModalButton = getByTestId('send-button')
  await act(async () => userEvent.click(openSendModalButton))

  // Change Transaction Type to transparent, title should change with it
  await act(async () => userEvent.click(getByText('Transparent')))
  await waitFor(() => expect(getByText('Confidential → Transparent')).toBeInTheDocument())

  // Set recipient to a confidential address, error pops up
  const confidentialRecipient = getByLabelText('Recipient')
  fireEvent.change(confidentialRecipient, {target: {value: CONFIDENTIAL_ADDRESS}})
  await waitFor(() => expect(queryByText('Invalid transparent address')).toBeInTheDocument())

  // Clear recipient, error message changes
  act(() => userEvent.clear(confidentialRecipient))
  await waitFor(() => expect(confidentialRecipient).toHaveAttribute('value', ''))
  await waitFor(() => expect(queryByText('Invalid transparent address')).not.toBeInTheDocument())
  await waitFor(() => expect(queryByText('Recipient must be set')).toBeInTheDocument())

  // Set recipient to an valid address
  fireEvent.change(confidentialRecipient, {target: {value: recipient}})
  await waitFor(() => expect(queryByText('Recipient must be set')).not.toBeInTheDocument())

  // Check correct fee estimates are shown for default (0) amount
  await waitFor(() => expect(queryByText('0.00000123', {exact: false})).toBeInTheDocument())
  await waitFor(() => expect(queryAllByText('0.00000456', {exact: false})).toHaveLength(2)) // Medium is used for total amount
  await waitFor(() => expect(queryByText('0.00000789', {exact: false})).toBeInTheDocument())

  // Amount should be set to 0 by default
  const confidentialAmount = getByLabelText('Amount')
  expect(confidentialAmount).toHaveAttribute('value', '0')

  // Clear amount, error pops up
  await act(async () => userEvent.clear(confidentialAmount))
  await waitFor(() => expect(queryByText('Must be a number greater than 0')).toBeInTheDocument())

  // Set amount to too high value, error changes
  fireEvent.change(confidentialAmount, {target: {value: `${usedEther.toString(10)}0`}})
  await waitFor(() =>
    expect(queryByText('Must be a number greater than 0')).not.toBeInTheDocument(),
  )
  await waitFor(() => expect(queryByText('Insufficient funds')).toBeInTheDocument())

  // Set amount to correct value by deleting last digit, error disappears
  await act(() => userEvent.type(confidentialAmount, '{backspace}'))
  await waitFor(() => expect(queryByText('Insufficient funds')).not.toBeInTheDocument())

  // Check correct fee estimates are shown for default used amount
  await waitFor(() => {
    Object.values(baseEstimates).forEach((estimate) => {
      const {strict: estimateFormatted} = abbreviateAmountForEnUS(
        Ether.fromBasic(mockEstimateCalculator(usedWei)(estimate)),
      )
      expect(queryByText(estimateFormatted, {exact: false})).toBeInTheDocument()
    })
  })

  // Click correct send button and check if it was called with correct params
  const sendButton = getAllByText(/Send.*/)[1]
  await act(async () => userEvent.click(sendButton))
  await waitFor(() =>
    expect(send).toBeCalledWith(
      recipient,
      usedWei,
      mockEstimateCalculator(usedWei)(baseEstimates.medium),
    ),
  )
})

test('Receive modal shows up with confidential address', async () => {
  const {getByTestId, getByText} = renderTransactionHistory({privateAddresses})
  const receiveButton = getByTestId('receive-button')
  userEvent.click(receiveButton)

  // Switch between confidential and transparent view is visible
  expect(getByText('Confidential')).toBeInTheDocument()
  expect(getByText('Transparent')).toBeInTheDocument()

  // Title is visible
  expect(getByText('Your Confidential Address')).toBeInTheDocument()

  // Address and QR code is visible
  expect(getByText(CONFIDENTIAL_ADDRESS)).toBeInTheDocument()
  expect(getByTestId('qr-code')).toBeInTheDocument()

  // Address can be copied
  const copyAddressButton = getByText('Copy Address')
  act(() => userEvent.click(copyAddressButton))
  await waitFor(() =>
    expect(mockedCopyToClipboard).toBeCalledWith(CONFIDENTIAL_ADDRESS, expect.any(String)),
  )
  expect(mockedCopyToClipboard).toHaveBeenCalledTimes(1)
})

test('Receive modal works with transparent addresses', async () => {
  const getTransparentAddress = (index: number): string =>
    dummyTransparentAccounts[dummyTransparentAccounts.length - 1 - index].address

  const {getByTestId, getByText, queryByText} = renderTxHistoryWithTransparentAddressGenerator(
    dummyTransparentAccounts,
  )
  const receiveButton = getByTestId('receive-button')
  userEvent.click(receiveButton)

  const switchToTransparentButton = getByText('Transparent')
  act(() => userEvent.click(switchToTransparentButton))

  // Should say there are no addresses
  expect(getByText('No known addresses')).toBeInTheDocument()

  // No address can be copied
  const copyAddressButton = getByText('Copy Address')
  act(() => userEvent.click(copyAddressButton))
  await waitFor(() => expect(mockedCopyToClipboard).not.toBeCalled())

  // One can generate a new address and 'No known addresses disappears' and new address is shown
  const generateNewButton = getByText('Generate New', {exact: false})
  act(() => userEvent.click(generateNewButton))
  await waitFor(() => expect(queryByText('No known addresses')).not.toBeInTheDocument())
  await waitFor(() => expect(getByText(getTransparentAddress(0))).toBeInTheDocument())

  // QR code is also visible and address can be copied
  expect(getByTestId('qr-code')).toBeInTheDocument()
  act(() => userEvent.click(copyAddressButton))
  await waitFor(() =>
    expect(mockedCopyToClipboard).toBeCalledWith(getTransparentAddress(0), expect.any(String)),
  )

  // Generate 1 more address
  act(() => userEvent.click(generateNewButton))
  await waitFor(() => expect(getByText(getTransparentAddress(1))).toBeInTheDocument())
})
