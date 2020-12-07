import {assert} from 'chai'
import web3 from 'web3'
import {asEther, asWei} from './units'
import {getPendingBalance, mergeTransactions, Transaction} from './wallet-state'

const createTestTx = (
  direction: Transaction['direction'],
  status: Transaction['status'],
  etherValue: number,
  etherFee: number,
): Transaction => ({
  direction,
  status,
  value: asEther(etherValue),
  fee: asEther(etherFee),
  // defaults:
  from: '0xffffffffffffffffffffffffffffffffffffffff',
  to: '0xffffffffffffffffffffffffffffffffffffffff',
  hash: web3.utils.keccak256(direction + status + etherValue + etherFee),
  blockNumber: 1,
  timestamp: new Date(0),
  gasPrice: asWei(1),
  gas: 1,
  gasUsed: 1,
  contractAddress: null,
})

//
// Pending transaction tests
//

const pendingTestBaseTransactions: Transaction[] = [
  createTestTx('incoming', 'confirmed', 100, 1),
  createTestTx('incoming', 'persisted_depth', 100, 1),
  createTestTx('outgoing', 'confirmed', 100, 1),
  createTestTx('outgoing', 'persisted_checkpoint', 100, 1),
]
const pending1 = createTestTx('outgoing', 'pending', 100, 10)
const pending2 = createTestTx('outgoing', 'pending', 200, 10)
const incomingPending = createTestTx('incoming', 'pending', 300, 10)

describe('pending balance calculation', () => {
  it('calculates pending balance correctly in case of no pending txns', () => {
    assert.deepEqual(getPendingBalance(pendingTestBaseTransactions), asEther(0))
  })

  it('calculates pending balance correctly in case of 1 pending txn', () => {
    assert.deepEqual(getPendingBalance([...pendingTestBaseTransactions, pending1]), asEther(110))
  })

  it('calculates pending balance correctly in case of multiple pending txns', () => {
    assert.deepEqual(
      getPendingBalance([...pendingTestBaseTransactions, pending1, pending2]),
      asEther(320),
    )
  })

  it('calculates pending balance correctly in case of an incoming pending txn', () => {
    // Adding an incoming pending tx doesn't make a difference
    assert.deepEqual(
      getPendingBalance([...pendingTestBaseTransactions, pending1, pending2, incomingPending]),
      asEther(320),
    )
  })
})

describe('transaction history merging', () => {
  it('marks disappearing pending transactions as failed', () => {
    const previous = [...pendingTestBaseTransactions, pending1]
    const current = pendingTestBaseTransactions

    const result = mergeTransactions(current)(previous)

    assert.deepEqual(result, [{...pending1, status: 'failed'}, ...pendingTestBaseTransactions])
  })

  it('keeps failed transactions', () => {
    const failed: Transaction = {...pending1, status: 'failed'}
    const previous = [...pendingTestBaseTransactions, failed]
    const current = pendingTestBaseTransactions

    const result = mergeTransactions(current)(previous)

    assert.deepEqual(result, [failed, ...pendingTestBaseTransactions])
  })

  it('keeps confirmed and persisted transactions which disappeared', () => {
    const previous = pendingTestBaseTransactions
    const current: Transaction[] = []

    const result = mergeTransactions(current)(previous)

    assert.deepEqual(result, previous)
  })

  it('prefers new transactions if status changes', () => {
    const confirmed: Transaction = {...pending1, status: 'confirmed'}
    const previous = [...pendingTestBaseTransactions, pending1]
    const current = [confirmed, ...pendingTestBaseTransactions]

    const result = mergeTransactions(current)(previous)

    assert.deepEqual(result, current)
  })
})
