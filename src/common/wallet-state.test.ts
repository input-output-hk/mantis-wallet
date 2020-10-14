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

it('calculates pending balance correctly', () => {
  const transactions: Transaction[] = [
    createTestTx('incoming', 'confirmed', 100, 1),
    createTestTx('incoming', 'persisted', 100, 1),
    createTestTx('outgoing', 'confirmed', 100, 1),
    createTestTx('outgoing', 'persisted', 100, 1),
  ]

  // No pending balance
  assert.deepEqual(getPendingBalance(transactions), asEther(0))

  // Add a pending tx with 200 ether value + 10 ether fee
  const pending1 = createTestTx('outgoing', 'pending', 100, 10)
  assert.deepEqual(getPendingBalance([...transactions, pending1]), asEther(110))

  // Add another pending tx with 100 ether value + 10 ether fee
  const pending2 = createTestTx('outgoing', 'pending', 200, 10)
  assert.deepEqual(getPendingBalance([...transactions, pending1, pending2]), asEther(320))

  // Adding an incoming pending tx doesn't make a difference
  const pending3 = createTestTx('incoming', 'pending', 300, 10)
  assert.deepEqual(getPendingBalance([...transactions, pending1, pending2, pending3]), asEther(320))
})
