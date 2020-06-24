import {assert} from 'chai'
import BigNumber from 'bignumber.js'
import {getPendingBalance, BurnStatus} from './pob-state'
import {createBurnStatus} from '../common/test-helpers'

jest.mock('../config/renderer.ts')

it('gathers pending balance correctly', () => {
  const B1_TX_FOUND = createBurnStatus('tx_found', 1, 'BTC_TESTNET')
  const B1_PROOF_FAIL = createBurnStatus('proof_fail', 2, 'BTC_TESTNET')
  const B1_COMM_SUBMITTED = createBurnStatus('commitment_submitted', 4, 'BTC_TESTNET')
  const B1_COMM_APPEARED = createBurnStatus('commitment_appeared', 8, 'BTC_TESTNET')
  const B1_COMM_FAILED = createBurnStatus('commitment_fail', 16, 'BTC_TESTNET')
  const B1_REDEEM_APPEARED = createBurnStatus('redeem_appeared', 32, 'BTC_TESTNET')
  const B1_REDEEM_BY_OTHER = createBurnStatus('redeem_another_prover', 64, 'BTC_TESTNET')
  const B1_REDEEM_FAILED = createBurnStatus('redeem_fail', 128, 'BTC_TESTNET')

  // check filtering by status one-by-one
  assert.deepEqual(getPendingBalance({b1: {lastStatuses: [B1_TX_FOUND]}}), {
    BTC_TESTNET: new BigNumber(B1_TX_FOUND.tx_value),
  })
  assert.deepEqual(getPendingBalance({b1: {lastStatuses: [B1_PROOF_FAIL]}}), {})
  assert.deepEqual(getPendingBalance({b1: {lastStatuses: [B1_COMM_SUBMITTED]}}), {
    BTC_TESTNET: new BigNumber(B1_COMM_SUBMITTED.tx_value),
  })
  assert.deepEqual(getPendingBalance({b1: {lastStatuses: [B1_COMM_APPEARED]}}), {
    BTC_TESTNET: new BigNumber(B1_COMM_APPEARED.tx_value),
  })
  assert.deepEqual(getPendingBalance({b1: {lastStatuses: [B1_COMM_FAILED]}}), {})
  assert.deepEqual(getPendingBalance({b1: {lastStatuses: [B1_REDEEM_APPEARED]}}), {})
  assert.deepEqual(getPendingBalance({b1: {lastStatuses: [B1_REDEEM_BY_OTHER]}}), {})
  assert.deepEqual(getPendingBalance({b1: {lastStatuses: [B1_REDEEM_FAILED]}}), {})

  // check everything together
  const B2_TX_FOUND = createBurnStatus('tx_found', 256, 'BTC_TESTNET')
  const B3_ETH_TX_FOUND = createBurnStatus('tx_found', 521, 'ETH_TESTNET')

  const allBurnStatuses: Record<string, BurnStatus> = {
    'burn-address-1': {
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
    'burn-address-2': {
      lastStatuses: [B2_TX_FOUND],
    },
    'burn-address-3': {
      lastStatuses: [B3_ETH_TX_FOUND],
    },
  }

  assert.deepEqual(getPendingBalance(allBurnStatuses), {
    BTC_TESTNET: new BigNumber(
      B1_TX_FOUND.tx_value +
        B1_COMM_SUBMITTED.tx_value +
        B1_COMM_APPEARED.tx_value +
        B2_TX_FOUND.tx_value,
    ),
    ETH_TESTNET: new BigNumber(B3_ETH_TX_FOUND.tx_value),
  })
})
