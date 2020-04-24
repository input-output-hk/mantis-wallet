import '@testing-library/jest-dom/extend-expect'
import React from 'react'
import BigNumber from 'bignumber.js'
import {render, wait, RenderResult} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {BurnActions} from './BurnActions'
import {CHAINS} from './chains'
import {UNITS} from '../common/units'
import {abbreviateAmount, formatPercentage} from '../common/formatters'
import {WalletState, WalletStatus, SynchronizationStatus} from '../common/wallet-state'
import {BurnActivity} from './BurnActivity'
import {BurnApiStatus, BurnStatusType} from './api/prover'
import {makeWeb3Worker} from '../web3'
import {mockWeb3Worker} from '../web3-mock'
import {BurnStatusDisplay, TX_VALUE_TOO_LOW_MESSAGE} from './BurnStatusDisplay'

const {ETH_TESTNET} = CHAINS

const web3 = makeWeb3Worker(mockWeb3Worker)

jest.mock('../config/renderer.ts')
jest.mock('react-inlinesvg')
jest.mock('./pob-state.tsx', () => ({
  ProofOfBurnState: {
    useContainer: () => ({
      burnBalances: [],
      provers: [
        {
          name: 'Test Prover',
          address: 'http://test-prover',
          rewards: {},
        },
      ],
    }),
  },
}))

test('Burn Centre shows correct burn balances and its buttons work as expected', async () => {
  const registerAuction = jest.fn()
  const burnCoins = jest.fn()

  const pending = UNITS[ETH_TESTNET.unitType].toBasic(new BigNumber(500))
  const available = UNITS[ETH_TESTNET.unitType].toBasic(new BigNumber(600))
  const {getByText} = render(
    <BurnActions
      burnBalances={[
        {
          chain: ETH_TESTNET,
          pending,
          available,
        },
      ]}
      onBurnCoins={burnCoins}
      onRegisterAuction={registerAuction}
    />,
  )

  // Click Burn Coins
  const burnCoinsButton = getByText('Burn Coins')
  expect(burnCoinsButton).toBeInTheDocument()
  userEvent.click(burnCoinsButton)
  await wait(() => expect(burnCoins).toHaveBeenCalled())

  // Click Register for Auction
  const registerAuctionButton = getByText('Register for Auction')
  expect(registerAuctionButton).toBeInTheDocument()
  userEvent.click(registerAuctionButton)
  await wait(() => expect(burnCoins).toHaveBeenCalled())

  // Check Burn Balances
  expect(getByText('Available')).toBeInTheDocument()
  expect(getByText('Pending Amount', {exact: false})).toBeInTheDocument()
  expect(getByText('Total Amount', {exact: false})).toBeInTheDocument()
  expect(getByText(`M-${ETH_TESTNET.symbol}`)).toBeInTheDocument()
  const allAmounts = [pending, available, pending.plus(available)]

  allAmounts
    .map((big) => abbreviateAmount(UNITS[ETH_TESTNET.unitType].fromBasic(big)).strict)
    .forEach((formattedNumber) => {
      const numberElem = getByText(formattedNumber)
      // abbreviated numbers are present
      expect(numberElem).toBeInTheDocument()
    })

  // Adding Burn Tx Manually
  const addBurnTxLink = getByText('Manual Burn')
  expect(addBurnTxLink).toBeInTheDocument()
  userEvent.click(addBurnTxLink)
  expect(getByText('Burn Transaction Id')).toBeInTheDocument()
})

test('Burn Activity list shows correct errors and burn statuses', async () => {
  const burnAddress1 = 'burn-address-1'

  const burnAddress2 = 'burn-address-2'
  const errorForBurnAddress2 = 'This is an error message for Burn Address #2'

  const burnAddress3 = 'burn-address-3'
  const errorForBurnAddress3 = 'This is an error message for Burn Address #3'
  const lastStatuses: Array<BurnApiStatus & {midnight_txid_height: number}> = [
    {
      status: 'BURN_OBSERVED',
      txid: 'source-chain-burn-transaction-id-1',
      chain: 'BTC_TESTNET',
      midnight_txid: 'midnight-transaction-id-1',
      midnight_txid_height: 10,
      burn_tx_height: 1,
      current_source_height: 1,
      processing_start_height: 1,
      last_tag_height: 1,
      tx_value: 20,
    },
    {
      status: 'BURN_OBSERVED',
      txid: 'source-chain-burn-transaction-id-2',
      chain: 'BTC_TESTNET',
      midnight_txid: 'midnight-transaction-id-2',
      midnight_txid_height: 10,
      burn_tx_height: 1,
      current_source_height: 1,
      processing_start_height: 1,
      last_tag_height: 1,
      tx_value: 20,
    },
  ]

  const initialState = {walletStatus: 'LOADED' as WalletStatus, web3}
  const {queryByText, getByText, getByPlaceholderText, getAllByText} = render(
    <WalletState.Provider initialState={initialState}>
      <BurnActivity
        burnStatuses={{
          [burnAddress1]: {
            lastStatuses: [],
          },
          [burnAddress2]: {
            lastStatuses: [],
            errorMessage: errorForBurnAddress2,
          },
          [burnAddress3]: {
            lastStatuses,
            errorMessage: errorForBurnAddress3,
          },
        }}
      />
    </WalletState.Provider>,
  )

  // all Burn Addresses are in the document
  expect(getByText(burnAddress1, {exact: false})).toBeInTheDocument()
  expect(getByText(burnAddress2, {exact: false})).toBeInTheDocument()
  expect(getAllByText(burnAddress3, {exact: false})).toHaveLength(2)

  // all valid statuses are shown
  lastStatuses.map(({txid, midnight_txid: mTxid, chain}) => {
    expect(getByText(txid)).toBeInTheDocument()
    mTxid && expect(getByText(txid)).toBeInTheDocument()
    expect(getAllByText(CHAINS[chain].symbol, {exact: false})).not.toHaveLength(0)
  })

  // no burn observed error is shown for Burn Address #1
  expect(
    getByText(`No burn transactions observed for burn address ${burnAddress1}.`),
  ).toBeInTheDocument()

  // error with no burn statuses is shown for Burn Address #2
  expect(
    getByText(`Gathering burn activity for ${burnAddress2} from the prover failed`, {exact: false}),
  ).toBeInTheDocument()
  expect(getByText(errorForBurnAddress2, {exact: false})).toBeInTheDocument()

  // errors are inlined with burn statuses for Burn Address #3
  expect(getAllByText(errorForBurnAddress3, {exact: false})).not.toHaveLength(0)

  // check if search works correctly
  const searchField = getByPlaceholderText('Burn Tx ID')
  expect(searchField).toBeInTheDocument()
  expect(queryByText('burn-transaction-id-2', {exact: false})).toBeInTheDocument()
  userEvent.type(searchField, 'burn-transaction-id-1')
  expect(queryByText('burn-transaction-id-2', {exact: false})).not.toBeInTheDocument()
})

const syncStatus: SynchronizationStatus = {
  mode: 'online',
  currentBlock: 10,
  highestKnownBlock: 15,
  percentage: 25,
}

const burnStatus = {
  txid: 'source-chain-burn-transaction-id-1',
  chain: 'BTC_TESTNET',
  midnight_txid: 'midnight-transaction-id-1',
  midnight_txid_height: 10,
  burn_tx_height: 1000,
  current_source_height: 1027,
  processing_start_height: 1100,
  last_tag_height: 1,
  tx_value: 20,
}

const renderBurnStatusDisplay = (status: BurnStatusType): RenderResult =>
  render(
    <BurnStatusDisplay
      burnStatus={
        {
          status,
          ...burnStatus,
        } as BurnApiStatus & {midnight_txid_height: number}
      }
      address={'burnAddress'}
      syncStatus={syncStatus}
    />,
  )

test('Burn Status - Display burn transaction found', async () => {
  const {getByText, getAllByTitle} = renderBurnStatusDisplay('BURN_OBSERVED')

  expect(getByText(`${formatPercentage(0.27)}%`)).toBeInTheDocument()
  expect(getAllByTitle('Checked')).toHaveLength(1)
  expect(getAllByTitle('In progress')).toHaveLength(1)
  expect(getAllByTitle('Unknown')).toHaveLength(2)
})

test('Burn Status - Display fee too low error', async () => {
  const {getByText, getAllByTitle} = renderBurnStatusDisplay('TX_VALUE_TOO_LOW')

  expect(getByText(TX_VALUE_TOO_LOW_MESSAGE)).toBeInTheDocument()
  expect(getAllByTitle('Checked')).toHaveLength(1)
  expect(getAllByTitle('Failed')).toHaveLength(3)
})

test('Burn Status - Display proof ready status', async () => {
  const {getAllByTitle} = renderBurnStatusDisplay('PROOF_READY')

  expect(getAllByTitle('Checked')).toHaveLength(2)
  expect(getAllByTitle('In progress')).toHaveLength(1)
  expect(getAllByTitle('Unknown')).toHaveLength(1)
})

test('Burn Status - Display proving started status', async () => {
  const {getAllByTitle} = renderBurnStatusDisplay('COMMITMENT_APPEARED')

  expect(getAllByTitle('Checked')).toHaveLength(2)
  expect(getAllByTitle('In progress')).toHaveLength(1)
  expect(getAllByTitle('Unknown')).toHaveLength(1)
})

test('Burn Status - Display proving successful status', async () => {
  const {getAllByTitle} = renderBurnStatusDisplay('REVEAL_APPEARED')

  expect(getAllByTitle('Checked')).toHaveLength(3)
  expect(getAllByTitle('In progress')).toHaveLength(1)
})

test('Burn Status - Display proving confirmed status', async () => {
  const {getAllByTitle} = renderBurnStatusDisplay('REVEAL_CONFIRMED')

  expect(getAllByTitle('Checked')).toHaveLength(4)
})
