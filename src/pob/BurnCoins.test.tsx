import '@testing-library/jest-dom/extend-expect'
import React from 'react'
import {render, waitFor} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {CHAINS} from './chains'
import {expectCalledOnClick} from '../common/test-helpers'
import {BurnCoinsChooseToken} from './burn-coins/BurnCoinsChooseToken'
import {BurnCoinsGenerateAddress} from './burn-coins/BurnCoinsGenerateAddress'
import {BurnCoinsShowAddress} from './burn-coins/BurnCoinsShowAddress'

const {ETH_TESTNET, BTC_TESTNET} = CHAINS

jest.mock('../config/renderer.ts')

const provers = [
  {
    name: 'Test-Prover',
    address: 'http://test-prover',
    rewards: {ETH_TESTNET: 15},
  },
]

test('Burn Coins - Choose Tokens step', () => {
  const chooseChain = jest.fn()

  const chainsUsed = [ETH_TESTNET, BTC_TESTNET]
  const {getByText} = render(<BurnCoinsChooseToken chains={chainsUsed} chooseChain={chooseChain} />)

  chainsUsed.map((chain) => {
    const tokenChooser = getByText(`Burn ${chain.name} for M-${chain.symbol}`)
    userEvent.click(tokenChooser)
    expect(chooseChain).toBeCalledWith(chain)
  })
})

test('Burn Coins - Generate Address step', async () => {
  const cancel = jest.fn()
  const generateBurnAddress = jest.fn()

  const chain = ETH_TESTNET
  const {getByText, getByRole} = render(
    <BurnCoinsGenerateAddress
      chain={chain}
      provers={provers}
      transparentAddresses={['transparent-address-1']}
      cancel={cancel}
      generateBurnAddress={generateBurnAddress}
    />,
  )

  expect(getByText('Token Exchange Rate', {exact: false})).toBeInTheDocument()
  expect(getByText('Select Receive Address', {exact: false})).toBeInTheDocument()
  expect(getByText('transparent-address-1')).toBeInTheDocument()
  expect(getByText('Test-Prover', {exact: false})).toBeInTheDocument()
  expect(getByText('http://test-prover', {exact: false})).toBeInTheDocument()
  expect(getByText(`Assign reward in M-${chain.symbol} for your prover`)).toBeInTheDocument()

  const generateBurnAddressButton = getByText(`Generate ${chain.symbol} Address`)

  const approvalCheckbox = getByRole('checkbox')
  userEvent.click(approvalCheckbox)
  await waitFor(() => expect(generateBurnAddressButton).toBeEnabled())

  await expectCalledOnClick(() => getByText('Cancel'), cancel)

  expect(generateBurnAddress).not.toBeCalled()
  userEvent.click(generateBurnAddressButton)
  await waitFor(() => expect(generateBurnAddress).toBeCalled())
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
  expect(getByText('Copy Code')).toBeInTheDocument()

  await expectCalledOnClick(() => getByText('← Go Back'), goBack)
})
