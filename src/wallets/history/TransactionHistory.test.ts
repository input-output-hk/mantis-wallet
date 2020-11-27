import {assert} from 'chai'
import web3 from 'web3'
import {mergeBatch, Transaction} from './TransactionHistory'
import {asEther, asWei} from '../../common/units'

describe('TransactionHistory', () => {
  describe('merging', () => {
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

    const pendingTestBaseTransactions: Transaction[] = [
      createTestTx('incoming', 'confirmed', 100, 1),
      createTestTx('incoming', 'persisted_depth', 100, 1),
      createTestTx('outgoing', 'confirmed', 100, 1),
      createTestTx('outgoing', 'persisted_checkpoint', 100, 1),
    ]
    const pending1 = createTestTx('outgoing', 'pending', 100, 10)

    it('marks disappearing pending transactions as failed', () => {
      const previous = [...pendingTestBaseTransactions, pending1]
      const current = pendingTestBaseTransactions

      const result = mergeBatch(previous, current)

      assert.deepEqual(result, [{...pending1, status: 'failed'}, ...pendingTestBaseTransactions])
    })

    it('keeps failed transactions', () => {
      const failed: Transaction = {...pending1, status: 'failed'}
      const previous = [...pendingTestBaseTransactions, failed]
      const current = pendingTestBaseTransactions

      const result = mergeBatch(previous, current)

      assert.deepEqual(result, [failed, ...pendingTestBaseTransactions])
    })

    it('keeps confirmed and persisted transactions which disappeared', () => {
      const previous = pendingTestBaseTransactions
      const current: Transaction[] = []

      const result = mergeBatch(previous, current)

      assert.deepEqual(result, previous)
    })

    it('prefers new transactions if status changes', () => {
      const confirmed: Transaction = {...pending1, status: 'confirmed'}
      const previous = [...pendingTestBaseTransactions, pending1]
      const current = [confirmed, ...pendingTestBaseTransactions]

      const result = mergeBatch(previous, current)

      assert.deepEqual(result, current)
    })
  })
})
