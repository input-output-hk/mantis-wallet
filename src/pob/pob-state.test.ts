import {assert} from 'chai'
import BigNumber from 'bignumber.js'
import {getPendingBalance, BurnStatus, BurnAddressInfo} from './pob-state'
import {createBurnStatus} from '../common/test-helpers'

jest.mock('../config/renderer.ts')

it('gathers pending balance correctly', () => {
  const prover = {
    name: 'Test prover',
    address: 'http://test.prover.address',
  }
  const burnAddress1 = 'burn-address-1'
  const burnWatcher = {
    burnAddress: burnAddress1,
    prover,
  }
  const burnAddressInfo: BurnAddressInfo = {
    midnightAddress: 'transparent-midnight-address',
    chainId: 'BTC_TESTNET',
    autoConversion: false,
    reward: 1e16,
  }
  const B1_TX_FOUND = createBurnStatus('tx_found', 1)
  const B1_PROOF_FAIL = createBurnStatus('proof_fail', 2)
  const B1_COMM_SUBMITTED = createBurnStatus('commitment_submitted', 4)
  const B1_COMM_APPEARED = createBurnStatus('commitment_appeared', 8)
  const B1_COMM_FAILED = createBurnStatus('commitment_fail', 16)
  const B1_REDEEM_APPEARED = createBurnStatus('redeem_appeared', 32)
  const B1_REDEEM_BY_OTHER = createBurnStatus('redeem_another_prover', 64)
  const B1_REDEEM_FAILED = createBurnStatus('redeem_fail', 128)

  const burnAddresses = {[burnAddress1]: burnAddressInfo}

  // check filtering by status one-by-one
  assert.deepEqual(getPendingBalance([{burnWatcher, lastStatuses: [B1_TX_FOUND]}], burnAddresses), {
    BTC_TESTNET: new BigNumber(B1_TX_FOUND.tx_value),
  })
  assert.deepEqual(
    getPendingBalance([{burnWatcher, lastStatuses: [B1_PROOF_FAIL]}], burnAddresses),
    {},
  )
  assert.deepEqual(
    getPendingBalance([{burnWatcher, lastStatuses: [B1_COMM_SUBMITTED]}], burnAddresses),
    {
      BTC_TESTNET: new BigNumber(B1_COMM_SUBMITTED.tx_value),
    },
  )
  assert.deepEqual(
    getPendingBalance([{burnWatcher, lastStatuses: [B1_COMM_APPEARED]}], burnAddresses),
    {
      BTC_TESTNET: new BigNumber(B1_COMM_APPEARED.tx_value),
    },
  )
  assert.deepEqual(
    getPendingBalance([{burnWatcher, lastStatuses: [B1_COMM_FAILED]}], burnAddresses),
    {},
  )
  assert.deepEqual(
    getPendingBalance([{burnWatcher, lastStatuses: [B1_REDEEM_APPEARED]}], burnAddresses),
    {},
  )
  assert.deepEqual(
    getPendingBalance([{burnWatcher, lastStatuses: [B1_REDEEM_BY_OTHER]}], burnAddresses),
    {},
  )
  assert.deepEqual(
    getPendingBalance([{burnWatcher, lastStatuses: [B1_REDEEM_FAILED]}], burnAddresses),
    {},
  )

  // check everything together
  const burnAddress2 = 'burn-address-2'
  const B2_TX_FOUND = createBurnStatus('tx_found', 256)
  const burnAddress3 = 'burn-address-3'
  const B3_ETH_TX_FOUND = createBurnStatus('tx_found', 521)

  const allBurnStatuses: BurnStatus[] = [
    {
      burnWatcher,
      lastStatuses: [
        B1_TX_FOUND,
        B1_PROOF_FAIL,
        B1_COMM_SUBMITTED,
        B1_COMM_APPEARED,
        B1_COMM_FAILED,
        B1_REDEEM_APPEARED,
        B1_REDEEM_BY_OTHER,
        B1_REDEEM_FAILED,
      ],
    },
    {
      burnWatcher: {burnAddress: burnAddress2, prover},
      lastStatuses: [B2_TX_FOUND],
    },
    {
      burnWatcher: {burnAddress: burnAddress3, prover},
      lastStatuses: [B3_ETH_TX_FOUND],
    },
  ]

  assert.deepEqual(
    getPendingBalance(allBurnStatuses, {
      [burnAddress1]: burnAddressInfo,
      [burnAddress2]: burnAddressInfo,
      [burnAddress3]: {...burnAddressInfo, chainId: 'ETH_TESTNET'},
    }),
    {
      BTC_TESTNET: new BigNumber(
        B1_TX_FOUND.tx_value +
          B1_COMM_SUBMITTED.tx_value +
          B1_COMM_APPEARED.tx_value +
          B2_TX_FOUND.tx_value,
      ),
      ETH_TESTNET: new BigNumber(B3_ETH_TX_FOUND.tx_value),
    },
  )
})
