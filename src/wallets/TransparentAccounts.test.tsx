import '@testing-library/jest-dom/extend-expect'
import _ from 'lodash/fp'
import React from 'react'
import BigNumber from 'bignumber.js'
import {render, fireEvent, waitFor, act} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {FeeEstimates, TransparentAccount, WalletState, WalletStatus} from '../common/wallet-state'
import {BuildJobState} from '../common/build-job-state'
import {GlacierState} from '../glacier-drop/glacier-state'
import {RedeemModal} from './modals/RedeemModal'
import {UNITS} from '../common/units'
import {createInMemoryStore} from '../common/store'
import {SettingsState, defaultSettingsData} from '../settings-state'
import {abbreviateAmount} from '../common/formatters'
import {findExactlyOneByTag} from '../common/test-helpers'
import {TransparentAccounts} from './TransparentAccounts'
import {Transaction, makeWeb3Worker} from '../web3'
import {mockWeb3Worker} from '../web3-mock'

const {Dust} = UNITS

jest.mock('../config/renderer.ts')

const web3 = makeWeb3Worker(mockWeb3Worker)

const WithProviders = ({children}: {children?: React.ReactNode}): JSX.Element => {
  const initialState = {
    walletStatus: 'LOADED' as WalletStatus,
    web3,
  }

  return (
    <SettingsState.Provider initialState={createInMemoryStore(defaultSettingsData)}>
      <BuildJobState.Provider>
        <WalletState.Provider initialState={initialState}>
          <GlacierState.Provider initialState={{web3}}>{children}</GlacierState.Provider>
        </WalletState.Provider>
      </BuildJobState.Provider>
    </SettingsState.Provider>
  )
}

test('Redeem works', async () => {
  const transparentAddress = 'transparent-address'
  const availableDust = new BigNumber(1234)
  const availableAtom = Dust.toBasic(availableDust)
  const usedDust = new BigNumber(345)
  const usedAtom = Dust.toBasic(usedDust)

  const baseEstimates = {
    low: new BigNumber(123),
    medium: new BigNumber(456),
    high: new BigNumber(789),
  }
  const mockEstimateCalculator = (amount: BigNumber) => (base: BigNumber): BigNumber =>
    base.plus(amount.dividedBy(1e7))
  const estimateFees = (amount: BigNumber): Promise<FeeEstimates> =>
    Promise.resolve(_.mapValues(mockEstimateCalculator(amount))(baseEstimates) as FeeEstimates)

  const redeem = jest.fn()
  const cancel = jest.fn()
  const {getByText, getAllByText, queryByText, getByTestId} = render(
    <SettingsState.Provider>
      <RedeemModal
        redeem={redeem}
        estimateRedeemFee={estimateFees}
        transparentAccount={{
          address: transparentAddress,
          index: 1,
          balance: availableAtom,
          midnightTokens: {},
        }}
        onCancel={cancel}
        visible
      />
    </SettingsState.Provider>,
  )

  // First we wait for the estimates to be loaded
  expect(getByText('Loading estimates')).toBeInTheDocument()
  await waitFor(() => expect(queryByText('Custom')).toBeInTheDocument())
  await waitFor(() => expect(queryByText('Slow')).toBeInTheDocument())
  await waitFor(() => expect(queryByText('Average')).toBeInTheDocument())
  await waitFor(() => expect(queryByText('Fast')).toBeInTheDocument())

  // Check correct fee estimates are shown for default (0) amount
  await waitFor(() => {
    Object.values(baseEstimates).forEach((estimate) => {
      const {strict: estimateFormatted} = abbreviateAmount(Dust.fromBasic(estimate))
      expect(queryByText(estimateFormatted, {exact: false})).toBeInTheDocument()
    })
  })

  // Apply confidentiality is the name of the title and the button too
  const applyConfidentialityTexts = getAllByText('Apply Confidentiality')
  expect(applyConfidentialityTexts).toHaveLength(2)

  // 'Available amount' field and its value is in the document
  expect(getByText('Available Amount')).toBeInTheDocument()
  const {strict: availableBalanceFormatted} = abbreviateAmount(availableDust)
  expect(getByText(availableBalanceFormatted)).toBeInTheDocument()

  // 'Amount' field, 'Fee' field are in the document
  expect(getByText('Amount')).toBeInTheDocument()
  expect(getByText('Fee')).toBeInTheDocument()

  // Description of the action is in the document
  expect(
    getByText(
      'This transaction will move selected funds to a confidential address which will remove their visibility from the Midnight Blockchain.',
    ),
  ).toBeInTheDocument()

  // Fee input should be set to average estimate by default
  const feeInput = findExactlyOneByTag(getByTestId('dialog-fee'), 'input')
  expect(feeInput).toHaveAttribute('value', Dust.fromBasic(baseEstimates.medium).toString(10))

  // Setting amount to a correct value
  const txAmountInput = getByTestId('redeem-tx-amount')
  await act(async () => {
    fireEvent.change(txAmountInput, {target: {value: usedDust}})
  })

  // Check correct fee estimates are shown for default used amount
  await waitFor(() => {
    Object.values(baseEstimates).forEach((estimate) => {
      const {strict: estimateFormatted} = abbreviateAmount(
        Dust.fromBasic(mockEstimateCalculator(usedAtom)(estimate)),
      )
      expect(queryByText(estimateFormatted, {exact: false})).toBeInTheDocument()
    })
  })

  // Let's choose fast fee estimate
  const fastFeeEstimate = getByText('Fast')
  act(() => userEvent.click(fastFeeEstimate))

  // Now, let's choose custom fee estimate, it should make the fee estimation collapse
  const customFeeEstimate = getByText('Custom')
  act(() => userEvent.click(customFeeEstimate))
  await waitFor(() => expect(queryByText('Slow')).not.toBeInTheDocument())
  await waitFor(() => expect(queryByText('Average')).not.toBeInTheDocument())
  await waitFor(() => expect(queryByText('Fast')).not.toBeInTheDocument())

  // If the Apply Confidentiality button is clicked it should be called with the right params
  // Although custom estimate was clicked, it wasn't change, so it stayed on the Fast estimate
  await act(async () => userEvent.click(applyConfidentialityTexts[1]))
  await waitFor(() =>
    expect(redeem).toBeCalledWith(
      transparentAddress,
      usedAtom.toNumber(),
      mockEstimateCalculator(usedAtom)(baseEstimates.high).toNumber(),
    ),
  )
})

test('Redeem works with Full Amount button', async () => {
  const transparentAddress = 'transparent-address'
  const availableDust = new BigNumber(1234)
  const availableAtom = Dust.toBasic(availableDust)
  const mediumFeeEstimate = new BigNumber(456)
  const usedFeeDust = new BigNumber(0.1)
  const usedFeeAtom = Dust.toBasic(usedFeeDust)

  const estimateFees = (): Promise<FeeEstimates> =>
    Promise.resolve({
      low: new BigNumber(123),
      medium: mediumFeeEstimate,
      high: new BigNumber(789),
    })

  const redeem = jest.fn()
  const cancel = jest.fn()

  const {getByText, getAllByText, queryByText, getByTestId} = render(
    <SettingsState.Provider>
      <RedeemModal
        redeem={redeem}
        estimateRedeemFee={estimateFees}
        transparentAccount={{
          address: transparentAddress,
          index: 1,
          balance: availableAtom,
          midnightTokens: {},
        }}
        onCancel={cancel}
        visible
      />
    </SettingsState.Provider>,
  )

  // First we wait for the estimates to be loaded
  expect(getByText('Loading estimates')).toBeInTheDocument()
  await waitFor(() => expect(queryByText('Fast')).toBeInTheDocument())

  // Full Amount button should have an inactive class
  const fullAmountButton = getByTestId('full-amount')
  expect(fullAmountButton).toHaveClass('inactive')

  // When full amount is clicked:
  // - inactive class should be removed from the button
  // - estimates should be collapsed
  // - full amount input should be set to (available - fee)
  fireEvent.click(fullAmountButton)
  await waitFor(() => expect(fullAmountButton).not.toHaveClass('inactive'))
  await waitFor(() => expect(queryByText('Fast')).not.toBeInTheDocument())

  const txAmountInput = getByTestId('redeem-tx-amount')
  expect(txAmountInput).toHaveAttribute(
    'value',
    availableDust.minus(Dust.fromBasic(mediumFeeEstimate)).toString(10),
  )

  // Changing Fee should change Amount
  const feeInput = findExactlyOneByTag(getByTestId('dialog-fee'), 'input')
  fireEvent.change(feeInput, {target: {value: usedFeeDust.toString(10)}})
  await waitFor(() =>
    expect(txAmountInput).toHaveAttribute('value', availableDust.minus(usedFeeDust).toString(10)),
  )

  // Apply confidentiality is the name of the title and the button too
  const applyConfidentialityTexts = getAllByText('Apply Confidentiality')
  expect(applyConfidentialityTexts).toHaveLength(2)
  const applyConfidentialityButton = applyConfidentialityTexts[1]

  // If the Apply Confidentiality button is clicked it should be called with the right params
  await act(async () => userEvent.click(applyConfidentialityButton))
  await waitFor(() =>
    expect(redeem).toBeCalledWith(
      transparentAddress,
      availableAtom.minus(usedFeeAtom).toNumber(),
      usedFeeAtom.toNumber(),
    ),
  )
})

export const transparentAccounts: TransparentAccount[] = [
  {
    address: 'third-transparent-address',
    index: 2,
    balance: new BigNumber(0),
    midnightTokens: {},
  },
  {
    address: 'second-transparent-address',
    index: 1,
    balance: new BigNumber(0),
    midnightTokens: {},
  },
  {
    address: 'first-transparent-address',
    index: 0,
    balance: new BigNumber(1234),
    midnightTokens: {},
  },
]

export const transactions: Transaction[] = [
  {
    hash: '1',
    txStatus: {
      status: 'confirmed',
      atBlock: '0xb70ef5',
      timestamp: 1585118001,
    },
    txDetails: {
      txType: 'call',
      transparentTransactionHash: '123456',
      usedTransparentAccountIndexes: [0],
      transparentTransaction: {
        nonce: '0x1',
        gasPrice: 123,
        gasLimit: '0x1185920',
        sendingAddress: 'm-test-uns-ad1rjfgdj6fewrhlv6j5qxeck38ms2t5szhrmg6v7',
        receivingAddress: 'm-test-uns-ad1qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq79ndq95',
        value: '123',
        payload: '0xPAYLOAD',
      },
    },
    txDirection: 'outgoing',
    txValue: {
      value: '0x2cc4d20',
      fee: '0x1708f6e',
    },
  },
  {
    hash: '9',
    txStatus: {
      status: 'confirmed',
      atBlock: '0xb70ef8',
      timestamp: 1585118004,
    },
    txDetails: {
      txType: 'call',
      transparentTransactionHash: '1234567',
      usedTransparentAccountIndexes: [0, 2],
      transparentTransaction: {
        nonce: '0x1',
        gasPrice: 123,
        gasLimit: '0x1185920',
        sendingAddress: 'third-transparent-address',
        receivingAddress: 'first-transparent-address',
        value: '1230',
        payload: '0xPAYLOAD',
      },
    },
    txDirection: 'outgoing',
    txValue: {
      value: '0x2cc4d205',
      fee: '0x1708f6e',
    },
  },
]

test('Transparent accounts list', async () => {
  const generateAddress = jest.fn()
  const backToTransactions = jest.fn()

  const {getByText, queryByText, getAllByTestId} = render(
    <TransparentAccounts
      transparentAccounts={transparentAccounts}
      generateAddress={generateAddress}
      redeem={jest.fn()}
      estimateRedeemFee={jest.fn()}
      backToTransactions={backToTransactions}
      transactions={transactions}
    />,
    {wrapper: WithProviders},
  )

  // Title shows up
  expect(getByText('Transparent Accounts')).toBeInTheDocument()

  // Generate New Address works
  const generateNewAddressButton = getByText('Generate New Address')
  act(() => userEvent.click(generateNewAddressButton))
  await waitFor(() => expect(generateAddress).toBeCalled())

  // Back to Overview works
  const backToOverviewButton = getByText('Back to Overview')
  act(() => userEvent.click(backToOverviewButton))
  await waitFor(() => expect(backToTransactions).toBeCalled())

  // Table header shows
  expect(getByText('Account')).toBeInTheDocument()
  expect(getByText('Asset')).toBeInTheDocument()
  expect(getByText('Amount')).toBeInTheDocument()

  // All three accounts are visible by default
  transparentAccounts.forEach(({address}) => {
    expect(getByText(address)).toBeInTheDocument()
  })

  // Hide Empty Accounts switch is visible and by clicking it, it hide empty accounts
  const hideEmptySwitch = getByText('Hide Empty Accounts')
  act(() => userEvent.click(hideEmptySwitch))
  await waitFor(() => {
    transparentAccounts
      .filter(({balance}) => !balance.isZero())
      .forEach(({address}) => {
        expect(getByText(address)).toBeInTheDocument()
      })
  })

  // By clicking it again it shows every account again
  act(() => userEvent.click(hideEmptySwitch))
  await waitFor(() => {
    transparentAccounts.forEach(({address}) => {
      expect(getByText(address)).toBeInTheDocument()
    })
  })

  const [txsButtonNr1, txsButtonNr2, txsButtonNr3] = getAllByTestId('txs-button')

  // Second account shouldn't have txs, so button should be disabled
  expect(txsButtonNr2).toHaveAttribute('disabled')

  // Let's open first account's txs by clicking the button
  act(() => userEvent.click(txsButtonNr1))
  await waitFor(() => expect(queryByText('Collapse Transactions')).toBeInTheDocument())

  // Clicking it again closes it
  act(() => userEvent.click(txsButtonNr1))
  await waitFor(() => expect(queryByText('Collapse Transactions')).not.toBeInTheDocument())

  // Let's open 3rd account's txs by clicking the button
  act(() => userEvent.click(txsButtonNr3))
  await waitFor(() => expect(queryByText('Collapse Transactions')).toBeInTheDocument())

  // Clicking collapse message should also close txs
  const collapseTxsButton = getByText('Collapse Transactions')
  act(() => userEvent.click(collapseTxsButton))
  await waitFor(() => expect(queryByText('Collapse Transactions')).not.toBeInTheDocument())

  const [redeemButtonNr1, redeemButtonNr2, redeemButtonNr3] = getAllByTestId('redeem-button')

  // Empty balance on first two accounts in the list, they should have redeem button disabled
  expect(redeemButtonNr1).toHaveAttribute('disabled')
  expect(redeemButtonNr2).toHaveAttribute('disabled')

  // Last account should have funds and should open the redeem modal
  act(() => userEvent.click(redeemButtonNr3))
  await waitFor(() => expect(getByText('Cancel')).toBeInTheDocument())
})
