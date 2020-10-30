import {assert} from 'chai'
import {asEther, asWei} from './units'
import {getPendingBalance, getNextNonce, Transaction} from './wallet-state'

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
  hash: '1',
  blockNumber: 1,
  timestamp: new Date(0),
  gasPrice: asWei(1),
  gas: 1,
  gasUsed: 1,
  contractAddress: null,
})

it('calculates next nonce from transactions', () => {
  const transactions: Transaction[] = [
    createTestTx('outgoing', 'persisted', 100, 1),
    createTestTx('outgoing', 'confirmed', 100, 1),
    createTestTx('outgoing', 'pending', 100, 1),
    createTestTx('incoming', 'persisted', 100, 1),
    createTestTx('incoming', 'confirmed', 100, 1),
    createTestTx('incoming', 'pending', 100, 1),
  ]

  // Next nonce is equal to the number of outgoing transactions (including pending ones)
  assert.equal(getNextNonce(transactions), 3)
})

//
// Pending transaction tests
//

const pendingTestBaseTransactions: Transaction[] = [
  createTestTx('incoming', 'confirmed', 100, 1),
  createTestTx('incoming', 'persisted', 100, 1),
  createTestTx('outgoing', 'confirmed', 100, 1),
  createTestTx('outgoing', 'persisted', 100, 1),
]
const pending1 = createTestTx('outgoing', 'pending', 100, 10)
const pending2 = createTestTx('outgoing', 'pending', 200, 10)
const incomingPending = createTestTx('incoming', 'pending', 300, 10)

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
