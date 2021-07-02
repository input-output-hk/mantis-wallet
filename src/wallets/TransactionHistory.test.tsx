import '@testing-library/jest-dom/extend-expect'
import React, {useState} from 'react'
import {render, RenderResult, waitFor, act, fireEvent} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {some} from 'fp-ts/lib/Option'
import {TransactionHistory, TransactionHistoryProps} from './TransactionHistory'
import {Account, FeeEstimates, SynchronizationStatusOnline} from '../common/wallet-state'
import {abbreviateAmountForEnUS, createWithProviders} from '../common/test-helpers'
import {ADDRESS} from '../storybook-util/dummies'
import {mockedCopyToClipboard} from '../jest.config'
import {asWei, asEther, etherValue} from '../common/units'
import {Transaction} from './history'

export const mockSyncStatus: SynchronizationStatusOnline = {
  mode: 'online',
  type: 'blocks',
  currentBlock: 0,
  highestKnownBlock: 0,
  pulledStates: 0,
  knownStates: 0,
  lastNewBlockTimestamp: 0,
}

const tx1: Transaction = {
  hash: '1',
  from: '0x00112233445566778899aabbccddeeff00112233',
  to: '0xffeeddccbbaa0011223344556677889988776655',
  blockNumber: null,
  timestamp: new Date(1584527520),
  value: asEther(123),
  gasPrice: asWei(1e9),
  gas: 21000,
  gasUsed: 21000,
  fee: asWei(0),
  direction: 'incoming',
  status: 'confirmed',
  contractAddress: null,
}

const tx2: Transaction = {
  hash: '2',
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
}

const accounts: Account[] = [
  {
    address: ADDRESS,
    index: 0,
    balance: asEther(100),
    tokens: {},
  },
  {
    address: 'address-1',
    index: 1,
    balance: asEther(200),
    tokens: {},
  },
  {
    address: 'address-2',
    index: 2,
    balance: asEther(300),
    tokens: {},
  },
]

const estimateFees = (): Promise<FeeEstimates> =>
  Promise.resolve({
    low: asWei(100),
    medium: asWei(200),
    high: asWei(300),
  })

const getNextNonce = (): Promise<number> => Promise.resolve(42)

const defaultProps: TransactionHistoryProps = {
  transactions: [],
  accounts: accounts,
  availableBalance: some(asEther(1234)),
  estimateTransactionFee: estimateFees,
  getNextNonce: getNextNonce,
  syncStatus: mockSyncStatus,
  generateAddress: jest.fn(),
}

const renderTransactionHistory = (props: Partial<TransactionHistoryProps> = {}): RenderResult => {
  const usedProps = {
    ...defaultProps,
    ...props,
  }

  return render(<TransactionHistory {...usedProps} />, {wrapper: createWithProviders()})
}

const TxHistoryWithAddressGenerator = ({
  preparedAccounts,
}: {
  preparedAccounts: Account[]
}): JSX.Element => {
  const [counter, setCounter] = useState(1)

  const addresses = preparedAccounts.slice(-counter)

  return (
    <>
      <TransactionHistory
        {...defaultProps}
        accounts={addresses}
        generateAddress={(): Promise<void> => {
          setCounter(counter + 1)
          return Promise.resolve()
        }}
      />
    </>
  )
}

const renderTxHistoryWithAddressGenerator = (preparedAccounts: Account[] = []): RenderResult =>
  render(<TxHistoryWithAddressGenerator preparedAccounts={preparedAccounts} />, {
    wrapper: createWithProviders(),
  })

test('TransactionHistory shows proper message with empty tx list', () => {
  const {getByText} = renderTransactionHistory()
  expect(getByText("You haven't made a transaction")).toBeInTheDocument()
})

// txAmount
test('TransactionHistory shows proper tx amounts', () => {
  const {getByText} = renderTransactionHistory({transactions: [tx1, tx2]})
  const {strict: formattedNumber1} = abbreviateAmountForEnUS(etherValue(tx1.value))
  expect(getByText(`+${formattedNumber1}`)).toBeInTheDocument()
  const {strict: formattedNumber2} = abbreviateAmountForEnUS(
    etherValue(asWei(tx2.value.plus(tx2.fee))),
  )
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
  expect(getByText('Received')).toBeInTheDocument()
})

test('TransactionHistory shows `Outgoing` tx text', () => {
  const {getByText} = renderTransactionHistory({transactions: [tx2]})
  expect(getByText('Sent')).toBeInTheDocument()
})

// Modals
test('Send modal shows up', async () => {
  const availableAmount = some(asEther(123))

  const {getByTestId, getAllByText, getByText, queryByText} = renderTransactionHistory({
    availableBalance: availableAmount,
    syncStatus: {
      mode: 'synced',
      currentBlock: 0,
      lastNewBlockTimestamp: 0,
    },
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

  // 'Receiving Address' and 'Amount' fields are two times in the document
  expect(getByText('Receiving Address')).toBeInTheDocument()
  expect(getByText('Amount')).toBeInTheDocument()

  // Send button appeared (plus the one in TxHistory)
  expect(getAllByText(/Send.*/)).toHaveLength(3)
})

// TODO (ETCM-372) Add advanced transaction flow test cases and test confirmation screens
test('Send transaction works', async () => {
  const availableBalance = some(asEther(1230))
  const usedAmount = asEther(951)
  const password = 'Foobar1234'

  const feeEstimates = {
    low: asWei(1230000000000),
    medium: asWei(4560000000000),
    high: asWei(7890000000000),
  }

  const estimateFees = (): Promise<FeeEstimates> => Promise.resolve(feeEstimates)

  const {
    getByTestId,
    getByLabelText,
    getAllByText,
    queryByText,
    queryAllByText,
  } = renderTransactionHistory({
    availableBalance,
    estimateTransactionFee: estimateFees,
  })
  const openSendModalButton = getByTestId('send-button')
  await act(async () => userEvent.click(openSendModalButton))

  // Set recipient to a invalid address, error pops up
  const recipient = getByLabelText('Receiving Address')
  fireEvent.change(recipient, {target: {value: 'not-an-address'}})
  await waitFor(() => expect(queryByText('Invalid address')).toBeInTheDocument())

  // Clear recipient, error message changes
  act(() => userEvent.clear(recipient))
  await waitFor(() => expect(recipient).toHaveAttribute('value', ''))
  await waitFor(() => expect(queryByText('Invalid address')).not.toBeInTheDocument())
  await waitFor(() => expect(queryByText('Address must be set')).toBeInTheDocument())

  // Set recipient to a valid address
  fireEvent.change(recipient, {target: {value: ADDRESS}})
  await waitFor(() => expect(queryByText('Address must be set')).not.toBeInTheDocument())

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
  fireEvent.change(amount, {target: {value: `${etherValue(usedAmount).toString(10)}0`}})
  await waitFor(() =>
    expect(queryByText('Must be a number greater than 0')).not.toBeInTheDocument(),
  )
  await waitFor(() => expect(queryByText('Insufficient funds')).toBeInTheDocument())

  // Set amount to correct value by deleting last digit, error disappears
  await act(() => userEvent.type(amount, '{backspace}'))
  await waitFor(() => expect(queryByText('Insufficient funds')).not.toBeInTheDocument())

  // Choose slow fee
  const slowFeeEstimate = getAllByText('Slow')[0]
  await act(async () => userEvent.click(slowFeeEstimate))

  // Click correct send button
  const sendButton = getAllByText(/Send.*/)[2]
  await act(async () => userEvent.click(sendButton))

  // Enter password on the confirmation screen
  await waitFor(() => expect(queryByText('Password')).toBeInTheDocument())
  const passwordInput = getByLabelText('Password')
  fireEvent.change(passwordInput, {target: {value: password}})

  // Confirm transaction
  const confirmButton = getAllByText(/Confirm.*/)[0]
  await act(async () => userEvent.click(confirmButton))
})

test('Receive modal shows up with address', async () => {
  const {getByTestId, getByText} = renderTransactionHistory({accounts: accounts})

  // Open receive modal
  const receiveButton = getByTestId('receive-button')
  await act(async () => userEvent.click(receiveButton))

  // Title is visible
  await waitFor(() => expect(getByText('Your Address')).toBeInTheDocument())

  // Address and QR code is visible
  expect(getByText(ADDRESS)).toBeInTheDocument()
  expect(getByTestId('qr-code')).toBeInTheDocument()

  // Address can be copied
  const copyAddressButton = getByText('Copy Address')
  await act(async () => userEvent.click(copyAddressButton))

  await waitFor(() => {
    expect(mockedCopyToClipboard).toHaveBeenCalledTimes(1)
    expect(mockedCopyToClipboard).toHaveBeenCalledWith(ADDRESS, expect.any(String))
  })
})

// FIXME: ETCM-58
test.skip('Receive modal works with multiple addresses', async () => {
  const getAddress = (index: number): string => accounts[accounts.length - 1 - index].address

  const {getByTestId, getByText, queryByText} = renderTxHistoryWithAddressGenerator(accounts)
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
