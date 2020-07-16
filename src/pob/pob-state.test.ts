import {assert} from 'chai'
import BigNumber from 'bignumber.js'
import {getPendingBalance, BurnStatus, BurnAddressInfo} from './pob-state'
import {createBurnStatus} from '../common/test-helpers'

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
    reward: 1,
  }
  const B1_TX_FOUND = createBurnStatus('tx_found', 2, 'b1-tx-found')
  const B1_PROOF_FAIL = createBurnStatus('proof_fail', 4, 'b1-proof-fail')
  const B1_COMM_SUBMITTED = createBurnStatus('commitment_submitted', 8, 'b1-comm-submitted')
  const B1_COMM_APPEARED = createBurnStatus('commitment_appeared', 16, 'b1-comm-appeared')
  const B1_COMM_FAILED = createBurnStatus('commitment_fail', 32, 'b1-comm-failed')
  const B1_REDEEM_APPEARED = createBurnStatus('redeem_appeared', 64, 'b1-redeem-appeared')
  const B1_REDEEM_BY_OTHER = createBurnStatus('redeem_another_prover', 128, 'b1-redeem-by-other')
  const B1_REDEEM_FAILED = createBurnStatus('redeem_fail', 256, 'b1-redeem-failed')

  const burnAddresses = {[burnAddress1]: burnAddressInfo}

  // check filtering by status one-by-one
  assert.deepEqual(
    getPendingBalance([{burnWatcher, lastStatuses: [B1_TX_FOUND], isHidden: false}], burnAddresses),
    {
      BTC_TESTNET: new BigNumber(B1_TX_FOUND.tx_value - burnAddressInfo.reward),
    },
  )
  assert.deepEqual(
    getPendingBalance(
      [{burnWatcher, lastStatuses: [B1_PROOF_FAIL], isHidden: false}],
      burnAddresses,
    ),
    {},
  )
  assert.deepEqual(
    getPendingBalance(
      [{burnWatcher, lastStatuses: [B1_COMM_SUBMITTED], isHidden: false}],
      burnAddresses,
    ),
    {
      BTC_TESTNET: new BigNumber(B1_COMM_SUBMITTED.tx_value - burnAddressInfo.reward),
    },
  )
  assert.deepEqual(
    getPendingBalance(
      [{burnWatcher, lastStatuses: [B1_COMM_APPEARED], isHidden: false}],
      burnAddresses,
    ),
    {
      BTC_TESTNET: new BigNumber(B1_COMM_APPEARED.tx_value - burnAddressInfo.reward),
    },
  )
  assert.deepEqual(
    getPendingBalance(
      [{burnWatcher, lastStatuses: [B1_COMM_FAILED], isHidden: false}],
      burnAddresses,
    ),
    {},
  )
  assert.deepEqual(
    getPendingBalance(
      [{burnWatcher, lastStatuses: [B1_REDEEM_APPEARED], isHidden: false}],
      burnAddresses,
    ),
    {},
  )
  assert.deepEqual(
    getPendingBalance(
      [{burnWatcher, lastStatuses: [B1_REDEEM_BY_OTHER], isHidden: false}],
      burnAddresses,
    ),
    {},
  )
  assert.deepEqual(
    getPendingBalance(
      [{burnWatcher, lastStatuses: [B1_REDEEM_FAILED], isHidden: false}],
      burnAddresses,
    ),
    {},
  )

  // watching burn on the same prover should show it only once
  const prover2 = {
    name: 'Different prover',
    address: 'http://test.diff-prover.address',
  }
  assert.deepEqual(
    getPendingBalance(
      [
        {burnWatcher, lastStatuses: [B1_TX_FOUND], isHidden: false},
        {
          burnWatcher: {burnAddress: burnAddress1, prover: prover2},
          lastStatuses: [B1_TX_FOUND],
          isHidden: false,
        },
      ],
      burnAddresses,
    ),
    {
      BTC_TESTNET: new BigNumber(B1_TX_FOUND.tx_value - burnAddressInfo.reward),
    },
  )

  // check everything together
  const burnAddress2 = 'burn-address-2'
  const B2_TX_FOUND = createBurnStatus('tx_found', 512, 'b2-tx-found')
  const burnAddress3 = 'burn-address-3'
  const B3_ETH_TX_FOUND = createBurnStatus('tx_found', 1024, 'b3-eth-tx-found')

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
      isHidden: false,
    },
    {
      burnWatcher: {burnAddress: burnAddress1, prover: prover2},
      lastStatuses: [B1_TX_FOUND],
      isHidden: false,
    },
    {
      burnWatcher: {burnAddress: burnAddress2, prover},
      lastStatuses: [B2_TX_FOUND],
      isHidden: false,
    },
    {
      burnWatcher: {burnAddress: burnAddress3, prover},
      lastStatuses: [B3_ETH_TX_FOUND],
      isHidden: false,
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
        B1_TX_FOUND.tx_value -
          burnAddressInfo.reward +
          (B1_COMM_SUBMITTED.tx_value - burnAddressInfo.reward) +
          (B1_COMM_APPEARED.tx_value - burnAddressInfo.reward) +
          (B2_TX_FOUND.tx_value - burnAddressInfo.reward),
      ),
      ETH_TESTNET: new BigNumber(B3_ETH_TX_FOUND.tx_value - burnAddressInfo.reward),
    },
  )
})
