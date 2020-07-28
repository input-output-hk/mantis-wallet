import '@testing-library/jest-dom/extend-expect'
import React from 'react'
import BigNumber from 'bignumber.js'
import {render, RenderResult, waitFor, act} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {BurnActions} from './BurnActions'
import {POB_CHAINS} from './pob-chains'
import {UNITS} from '../common/units'
import {WalletState, WalletStatus, SynchronizationStatus} from '../common/wallet-state'
import {BuildJobState} from '../common/build-job-state'
import {
  expectCalledOnClick,
  WithSettingsProvider,
  abbreviateAmountForEnUS,
} from '../common/test-helpers'
import {BurnActivity} from './BurnActivity'
import {BurnStatusType} from './api/prover'
import {makeWeb3Worker} from '../web3'
import {mockWeb3Worker} from '../web3-mock'
import {BurnStatusDisplay} from './BurnStatusDisplay'
import {RealBurnStatus, BurnAddressInfo} from './pob-state'
import {ProverConfig} from '../config/type'
import {SettingsState} from '../settings-state'

const {ETH_TESTNET} = POB_CHAINS

const web3 = makeWeb3Worker(mockWeb3Worker)

test('Burn Centre shows correct burn balances and its buttons work as expected', async () => {
  const burnCoins = jest.fn()
  const addTx = jest.fn()

  const pending = UNITS[ETH_TESTNET.unitType].toBasic(new BigNumber(500))
  const available = UNITS[ETH_TESTNET.unitType].toBasic(new BigNumber(600))
  const prover = {
    name: 'Test Prover',
    address: 'http://test-prover',
    rewards: {},
  }
  const {getByText} = render(
    <BurnActions
      transparentAccounts={[
        {
          address: 'first-transparent-address',
          index: 0,
          balance: new BigNumber(0),
          midnightTokens: {
            ETH_TESTNET: available,
          },
        },
      ]}
      pendingBalances={{
        ETH_TESTNET: pending,
      }}
      provers={[prover]}
      burnAddresses={{
        'burn-address': {
          midnightAddress: 'transparent-midnight-address',
          chainId: 'ETH_TESTNET',
          autoConversion: false,
          reward: 1e16,
        },
      }}
      addTx={addTx}
      onBurnCoins={burnCoins}
    />,
    {wrapper: WithSettingsProvider},
  )

  // Click Burn Coins
  await expectCalledOnClick(() => getByText('Burn Coins'), burnCoins)

  // Check Burn Balances
  expect(getByText('Available')).toBeInTheDocument()
  expect(getByText('Pending Amount', {exact: false})).toBeInTheDocument()
  expect(getByText('Total Amount', {exact: false})).toBeInTheDocument()
  expect(getByText(`M-${ETH_TESTNET.symbol}`)).toBeInTheDocument()
  const allAmounts = [pending, available, pending.plus(available)]

  allAmounts
    .map((big) => abbreviateAmountForEnUS(UNITS[ETH_TESTNET.unitType].fromBasic(big)).strict)
    .forEach((formattedNumber) => {
      const numberElem = getByText(formattedNumber)
      // abbreviated numbers are present
      expect(numberElem).toBeInTheDocument()
    })

  // Adding Burn Tx Manually
  const addBurnTxLink = getByText('Manual Burn')
  await act(async () => userEvent.click(addBurnTxLink))
  await waitFor(() => expect(getByText('Burn Transaction Id')).toBeInTheDocument())
})

test('Burn Activity list shows correct errors and burn statuses', async () => {
  const burnAddress1 = 'burn-address-1'

  const burnAddress2 = 'burn-address-2'
  const errorForBurnAddress2 = 'This is an error message for Burn Address #2'

  const burnAddress3 = 'burn-address-3'
  const errorForBurnAddress3 = 'This is an error message for Burn Address #3'

  const burnAddressInfo: BurnAddressInfo = {
    midnightAddress: 'transparent-midnight-address',
    chainId: 'BTC_TESTNET',
    autoConversion: false,
    reward: 1e16,
  }

  const prover: ProverConfig = {
    name: 'Test Prover',
    address: 'http://test-prover',
  }

  const lastStatuses: RealBurnStatus[] = [
    {
      status: 'tx_found',
      txid: 'source-chain-burn-transaction-id-1',
      chain: 'BTC_TESTNET',
      commitment_txid: 'midnight-transaction-id-1',
      commitment_tx_height: 10,
      redeem_txid: null,
      redeem_tx_height: null,
      redeem_tx_timestamp: null,
      fail_reason: null,
      burn_tx_height: 1,
      current_source_height: 1,
      processing_start_height: 1,
      last_tag_height: 1,
      tx_value: 20,
      isHidden: false,
      timestamps: {
        tx_found: new Date(2020, 4, 17, 3, 24, 0),
        commitment_submitted: null,
        redeem_submitted: null,
      },
    },
    {
      status: 'tx_found',
      txid: 'source-chain-burn-transaction-id-2',
      chain: 'BTC_TESTNET',
      commitment_txid: 'midnight-transaction-id-1',
      commitment_tx_height: 10,
      redeem_txid: null,
      redeem_tx_height: null,
      redeem_tx_timestamp: null,
      fail_reason: null,
      burn_tx_height: 1,
      current_source_height: 1,
      processing_start_height: 1,
      last_tag_height: 1,
      tx_value: 20,
      isHidden: false,
      timestamps: {
        tx_found: new Date(2020, 4, 17, 3, 24, 0),
        commitment_submitted: null,
        redeem_submitted: null,
      },
    },
  ]

  const initialState = {walletStatus: 'LOADED' as WalletStatus, web3}
  const {queryByText, getByText, getByPlaceholderText, getAllByText} = render(
    <BuildJobState.Provider initialState={{web3}}>
      <SettingsState.Provider>
        <WalletState.Provider initialState={initialState}>
          <BurnActivity
            burnAddresses={{
              [burnAddress1]: burnAddressInfo,
              [burnAddress2]: burnAddressInfo,
              [burnAddress3]: burnAddressInfo,
            }}
            burnStatuses={[
              {
                burnWatcher: {burnAddress: burnAddress1, prover},
                lastStatuses: [],
                isHidden: false,
              },
              {
                burnWatcher: {burnAddress: burnAddress2, prover},
                lastStatuses: [],
                errorMessage: errorForBurnAddress2,
                isHidden: false,
              },
              {
                burnWatcher: {burnAddress: burnAddress3, prover},
                lastStatuses,
                errorMessage: errorForBurnAddress3,
                isHidden: false,
              },
            ]}
            hideBurnWatcher={jest.fn()}
            hideBurnProcess={jest.fn()}
          />
        </WalletState.Provider>
      </SettingsState.Provider>
    </BuildJobState.Provider>,
  )

  // all Burn Addresses are in the document
  expect(getByText(burnAddress1, {exact: false})).toBeInTheDocument()
  expect(getByText(burnAddress2, {exact: false})).toBeInTheDocument()
  expect(getAllByText(burnAddress3, {exact: false})).toHaveLength(2)

  // all valid statuses are shown
  lastStatuses.map(({txid, commitment_txid: mTxid}) => {
    expect(getByText(txid)).toBeInTheDocument()
    mTxid && expect(getByText(txid)).toBeInTheDocument()
    expect(
      getAllByText(POB_CHAINS[burnAddressInfo.chainId].symbol, {exact: false}),
    ).not.toHaveLength(0)
  })

  // no burn observed error is shown for Burn Address #1
  expect(
    getByText(
      `No burn transactions observed for burn address ${burnAddress1} by prover "${prover.name}".`,
    ),
  ).toBeInTheDocument()

  // error with no burn statuses is shown for Burn Address #2
  expect(
    getByText(`Gathering burn activity for ${burnAddress2} from prover "${prover.name}" failed`, {
      exact: false,
    }),
  ).toBeInTheDocument()
  expect(getByText(errorForBurnAddress2, {exact: false})).toBeInTheDocument()

  // errors are inlined with burn statuses for Burn Address #3
  expect(getAllByText(errorForBurnAddress3, {exact: false})).not.toHaveLength(0)

  // check if search works correctly
  const searchField = getByPlaceholderText('Burn Tx ID')
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
  commitment_txid: 'midnight-transaction-id-1',
  commitment_tx_height: 10,
  redeem_txid: null,
  burn_tx_height: 1000,
  current_source_height: 1027,
  processing_start_height: 1100,
  last_tag_height: 1,
  tx_value: 20,
}

const renderBurnStatusDisplay = (status: BurnStatusType): RenderResult =>
  render(
    <BurnStatusDisplay
      burnAddressInfo={{
        midnightAddress: 'transparent-midnight-address',
        chainId: 'BTC_TESTNET',
        autoConversion: false,
        reward: 1e16,
      }}
      burnStatus={
        {
          status,
          ...burnStatus,
        } as RealBurnStatus
      }
      burnWatcher={{
        burnAddress: 'burnAddress',
        prover: {
          name: 'Test Prover',
          address: 'http://test-prover',
        },
      }}
      syncStatus={syncStatus}
      hideBurnProcess={jest.fn()}
    />,
    {wrapper: WithSettingsProvider},
  )

test('Burn Status - Display burn transaction found', async () => {
  const {getAllByTitle} = renderBurnStatusDisplay('tx_found')

  expect(getAllByTitle('Checked')).toHaveLength(1)
  expect(getAllByTitle('In progress')).toHaveLength(1)
  expect(getAllByTitle('Unknown')).toHaveLength(2)
})

test('Burn Status - Display proof ready status', async () => {
  const {getAllByTitle} = renderBurnStatusDisplay('commitment_submitted')

  expect(getAllByTitle('Checked')).toHaveLength(2)
  expect(getAllByTitle('In progress')).toHaveLength(1)
  expect(getAllByTitle('Unknown')).toHaveLength(1)
})

test('Burn Status - Display proving started status', async () => {
  const {getAllByTitle} = renderBurnStatusDisplay('commitment_appeared')

  expect(getAllByTitle('Checked')).toHaveLength(2)
  expect(getAllByTitle('In progress')).toHaveLength(1)
  expect(getAllByTitle('Unknown')).toHaveLength(1)
})

test('Burn Status - Display proving successful status', async () => {
  const {getAllByTitle} = renderBurnStatusDisplay('redeem_appeared')

  expect(getAllByTitle('Checked')).toHaveLength(3)
  expect(getAllByTitle('In progress')).toHaveLength(1)
})
