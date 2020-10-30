import '@testing-library/jest-dom/extend-expect'
import React, {FunctionComponent, useState} from 'react'
import {render, RenderResult, waitFor, act, fireEvent} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Web3 from 'web3'
import {TransactionHistory, TransactionHistoryProps} from './TransactionHistory'
import {Account, WalletState, WalletStatus, FeeEstimates, Transaction} from '../common/wallet-state'
import {SettingsState} from '../settings-state'
import {abbreviateAmountForEnUS} from '../common/test-helpers'
import {BackendState} from '../common/backend-state'
import {ADDRESS} from '../storybook-util/dummies'
import {mockedCopyToClipboard} from '../jest.setup'
import {asWei, asEther, etherValue} from '../common/units'

const web3 = new Web3()

const tx1: Transaction = {
  hash: '1',
  from: '0x00112233445566778899aabbccddeeff00112233',
  to: '0xffeeddccbbaa0011223344556677889988776655',
  blockNumber: 1,
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
    low: asWei(100),
    medium: asWei(200),
    high: asWei(300),
  })

const defaultProps: TransactionHistoryProps = {
  transactions: [],
  accounts: accounts,
  availableBalance: asEther(1234),
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
    wrapper: WithProviders,
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
  const availableAmount = asEther(123)

  const {getByTestId, getAllByText, getByText, queryByText} = renderTransactionHistory({
    availableBalance: availableAmount,
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
  const availableBalance = asEther(1230)
  const usedAmount = asEther(951)
  const password = 'Foobar1234'

  const feeEstimates = {
    low: asWei(1230000000000),
    medium: asWei(4560000000000),
    high: asWei(7890000000000),
  }
  const estimateFees = (): Promise<FeeEstimates> => Promise.resolve(feeEstimates)

  const send = jest.fn()

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

  const passwordInput = getByLabelText('Password')
  fireEvent.change(passwordInput, {target: {value: password}})

  // Click correct send button and check if it was called with correct params
  const sendButton = getAllByText(/Send.*/)[2]
  await act(async () => userEvent.click(sendButton))
  await waitFor(() =>
    expect(send).toBeCalledWith(
      ADDRESS, // the address used
      usedAmount, // the amount used
      feeEstimates.low, // the lowest fee used
      password,
    ),
  )
})

test('Receive modal shows up with address', async () => {
  const {getByTestId, getByText} = renderTransactionHistory({accounts: accounts})
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
