import '@testing-library/jest-dom/extend-expect'
import React from 'react'
import BigNumber from 'bignumber.js'
import {render, waitFor, act, fireEvent, waitForElementToBeRemoved} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {CHAINS} from './chains'
import {expectCalledOnClick, WithSettingsProvider} from '../common/test-helpers'
import {BurnCoinsChooseToken} from './burn-coins/BurnCoinsChooseToken'
import {BurnCoinsGenerateAddress} from './burn-coins/BurnCoinsGenerateAddress'
import {BurnCoinsShowAddress} from './burn-coins/BurnCoinsShowAddress'
import {mockedCopyToClipboard} from '../jest.setup'
import {UNITS} from '../common/units'

const {ETH_TESTNET, BTC_TESTNET} = CHAINS
const Bitcoin = UNITS.Bitcoin

test('Burn Coins - Choose Tokens step', async () => {
  const chooseChain = jest.fn()
  const cancel = jest.fn()

  const chainsUsed = [ETH_TESTNET, BTC_TESTNET]
  const {getByText} = render(
    <BurnCoinsChooseToken chains={chainsUsed} chooseChain={chooseChain} cancel={cancel} />,
    {wrapper: WithSettingsProvider},
  )

  chainsUsed.map((chain) => {
    const tokenChooser = getByText(`Burn ${chain.name} for M-${chain.symbol}`)
    userEvent.click(tokenChooser)
    expect(chooseChain).toBeCalledWith(chain)
  })

  await expectCalledOnClick(() => getByText('← Go Back'), cancel)
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
  const proverMinFee = Bitcoin.fromBasic(new BigNumber(prover.rewards.BTC_TESTNET)).toString(10)
  const usedReward = new BigNumber(0.01)

  const {
    getByText,
    getByRole,
    getByLabelText,
    queryByText,
    findByText,
  } = render(
    <BurnCoinsGenerateAddress
      chain={chain}
      provers={[prover]}
      transparentAddresses={[transparentAddress]}
      cancel={cancel}
      generateBurnAddress={generateBurnAddress}
    />,
    {wrapper: WithSettingsProvider},
  )

  // Fields and values visible
  expect(getByText('Token Exchange Rate', {exact: false})).toBeInTheDocument()
  expect(getByText('Select Receive Address', {exact: false})).toBeInTheDocument()
  expect(getByText(transparentAddress)).toBeInTheDocument()
  expect(getByText(prover.name, {exact: false})).toBeInTheDocument()
  expect(getByText(prover.address, {exact: false})).toBeInTheDocument()

  // Reward field is preset to the prover's reward and it is disabled
  const rewardField = getByLabelText(`Assign reward in M-${chain.symbol} for your prover`, {
    exact: false,
  })
  await waitFor(() => expect(rewardField).toHaveAttribute('value', proverMinFee))
  expect(rewardField).toBeDisabled()

  // To change the reward, the user has to confirm he understands the risks
  const changeRewardButton = getByText('Change Reward')
  await act(async () => userEvent.click(changeRewardButton))
  const iUnderstandButton = await findByText('I understand')
  act(() => userEvent.click(iUnderstandButton))
  await waitForElementToBeRemoved(() => queryByText('I understand'))

  // Low reward should throw error
  const lowReward = Bitcoin.fromBasic(new BigNumber(prover.rewards.BTC_TESTNET - 10))
  fireEvent.change(rewardField, {target: {value: lowReward.toString(10)}})
  await waitFor(() => expect(getByText(`Must be at least ${proverMinFee}`)).toBeInTheDocument())

  // Change to valid reward
  fireEvent.change(rewardField, {target: {value: usedReward.toString(10)}})
  await waitFor(() =>
    expect(queryByText(`Must be at least ${proverMinFee}`)).not.toBeInTheDocument(),
  )

  const generateBurnAddressButton = getByText(`Generate ${chain.symbol} Address`)

  const approvalCheckbox = getByRole('checkbox')
  await act(async () => userEvent.click(approvalCheckbox))
  await waitFor(() => expect(generateBurnAddressButton).toBeEnabled())

  await expectCalledOnClick(() => getByText('← Go Back'), cancel)

  expect(generateBurnAddress).not.toBeCalled()
  await act(async () => userEvent.click(generateBurnAddressButton))
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
    {wrapper: WithSettingsProvider},
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
    {wrapper: WithSettingsProvider},
  )

  expect(getByText(`${chain.name} Burn Address`)).toBeInTheDocument()
  expect(getByText(burnAddress)).toBeInTheDocument()

  await expectCalledOnClick(() => getByText('← Go Back to Burn Centre'), goBack)

  const copyAddressButton = getByText('Copy Address')
  await act(async () => userEvent.click(copyAddressButton))
  await waitFor(() => expect(mockedCopyToClipboard).toBeCalledWith(burnAddress))
})
