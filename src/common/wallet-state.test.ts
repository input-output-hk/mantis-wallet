import {assert} from 'chai'
import {asEther, asWei} from './units'
import {getNextNonce, Transaction} from './wallet-state'

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
    createTestTx('outgoing', 'persisted', 100, 10),
    createTestTx('outgoing', 'confirmed', 100, 10),
    createTestTx('outgoing', 'pending', 100, 10),
    createTestTx('incoming', 'persisted', 100, 10),
    createTestTx('incoming', 'confirmed', 100, 10),
    createTestTx('incoming', 'pending', 100, 10),
  ]

  // Next nonce is equal to the number of outgoing transactions (including pending ones)
  assert.equal(getNextNonce(transactions), 3)
})
