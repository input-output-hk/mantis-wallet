import '@testing-library/jest-dom/extend-expect'
import React from 'react'
import BigNumber from 'bignumber.js'
import {render, waitFor, act, fireEvent} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {CHAINS} from './chains'
import {expectCalledOnClick} from '../common/test-helpers'
import {BurnCoinsChooseToken} from './burn-coins/BurnCoinsChooseToken'
import {BurnCoinsGenerateAddress} from './burn-coins/BurnCoinsGenerateAddress'
import {BurnCoinsShowAddress} from './burn-coins/BurnCoinsShowAddress'
import {mockedCopyToClipboard} from '../jest.setup'
import {UNITS} from '../common/units'

const {ETH_TESTNET, BTC_TESTNET} = CHAINS
const Bitcoin = UNITS.Bitcoin

jest.mock('../config/renderer.ts')

test('Burn Coins - Choose Tokens step', () => {
  const chooseChain = jest.fn()
  const cancel = jest.fn()

  const chainsUsed = [ETH_TESTNET, BTC_TESTNET]
  const {getByText} = render(
    <BurnCoinsChooseToken chains={chainsUsed} chooseChain={chooseChain} cancel={cancel} />,
  )

  chainsUsed.map((chain) => {
    const tokenChooser = getByText(`Burn ${chain.name} for M-${chain.symbol}`)
    userEvent.click(tokenChooser)
    expect(chooseChain).toBeCalledWith(chain)
  })

  expectCalledOnClick(() => getByText('← Go Back'), cancel)
})

test('Burn Coins - Generate Address step', async () => {
  const cancel = jest.fn()
  const generateBurnAddress = jest.fn()

  const chain = BTC_TESTNET
  const transparentAddress = 'transparent-address-1'
  const prover = {
    name: 'Test-Prover',
    address: 'http://test-prover',
    rewards: {BTC_TESTNET: 200},
  }
  const usedReward = new BigNumber(0.01)

  const {getByText, getByRole, getByLabelText, queryByText} = render(
    <BurnCoinsGenerateAddress
      chain={chain}
      provers={[prover]}
      transparentAddresses={[transparentAddress]}
      cancel={cancel}
      generateBurnAddress={generateBurnAddress}
    />,
  )

  // Fields and values visible
  expect(getByText('Token Exchange Rate', {exact: false})).toBeInTheDocument()
  expect(getByText('Select Receive Address', {exact: false})).toBeInTheDocument()
  expect(getByText(transparentAddress)).toBeInTheDocument()
  expect(getByText(prover.name, {exact: false})).toBeInTheDocument()
  expect(getByText(prover.address, {exact: false})).toBeInTheDocument()

  // Reward field is set to minimum default, which is 0.0001
  const rewardField = getByLabelText(`Assign reward in M-${chain.symbol} for your prover`)
  expect(rewardField).toHaveAttribute('value', '0.0001')

  // Low reward should throw error
  const lowReward = Bitcoin.fromBasic(new BigNumber(prover.rewards.BTC_TESTNET - 10))
  fireEvent.change(rewardField, {target: {value: lowReward.toString(10)}})
  await waitFor(() =>
    expect(
      getByText(
        `Must be at least ${Bitcoin.fromBasic(new BigNumber(prover.rewards.BTC_TESTNET)).toString(
          10,
        )}`,
      ),
    ).toBeInTheDocument(),
  )

  // Change to valid reward
  fireEvent.change(rewardField, {target: {value: usedReward.toString(10)}})
  await waitFor(() =>
    expect(
      queryByText(
        `Must be at least ${Bitcoin.fromBasic(new BigNumber(prover.rewards.BTC_TESTNET)).toString(
          10,
        )}`,
      ),
    ).not.toBeInTheDocument(),
  )

  const generateBurnAddressButton = getByText(`Generate ${chain.symbol} Address`)

  const approvalCheckbox = getByRole('checkbox')
  act(() => userEvent.click(approvalCheckbox))
  await waitFor(() => expect(generateBurnAddressButton).toBeEnabled())

  await expectCalledOnClick(() => getByText('← Go Back'), cancel)

  expect(generateBurnAddress).not.toBeCalled()
  act(() => userEvent.click(generateBurnAddressButton))
  await waitFor(() =>
    expect(generateBurnAddress).toBeCalledWith(
      prover,
      transparentAddress,
      Bitcoin.toBasic(usedReward).toNumber(),
    ),
  )
})

test('Generate Address shows warning when there are no provers', async () => {
  const chain = BTC_TESTNET

  const {getByText, getByRole} = render(
    <BurnCoinsGenerateAddress
      chain={chain}
      provers={[]}
      transparentAddresses={['transparent-address-1']}
      cancel={jest.fn()}
      generateBurnAddress={jest.fn()}
    />,
  )

  expect(getByText('No available provers for this token at the moment.')).toBeInTheDocument()
  expect(getByRole('button', {name: `Generate ${chain.symbol} Address`})).toBeDisabled()
})

test('Burn Coins - Show Address step', async () => {
  const burnAddress = 'burn-address'
  const chain = ETH_TESTNET
  const goBack = jest.fn()

  const {getByText} = render(
    <BurnCoinsShowAddress burnAddress={burnAddress} chain={chain} goBack={goBack} />,
  )

  expect(getByText(`${chain.name} Burn Address`)).toBeInTheDocument()
  expect(getByText(burnAddress)).toBeInTheDocument()

  await expectCalledOnClick(() => getByText('← Go Back to Burn Centre'), goBack)

  const copyAddressButton = getByText('Copy Address')
  act(() => userEvent.click(copyAddressButton))
  await waitFor(() => expect(mockedCopyToClipboard).toBeCalledWith(burnAddress))
})
