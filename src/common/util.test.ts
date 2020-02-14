import {assert} from 'chai'
import BigNumber from 'bignumber.js'
import {deserializeBigNumber, bigToNumber} from './util'

it('deserializes BigNumber correctly', () => {
  assert.deepEqual(deserializeBigNumber({s: 1, e: 0, c: [2]}), new BigNumber(2))
  assert.deepEqual(deserializeBigNumber({s: -1, e: 0, c: [2]}), new BigNumber(-2))
  assert.deepEqual(deserializeBigNumber({s: 1, e: 0, c: [2, 30000000000000]}), new BigNumber(2.3))
  assert.deepEqual(deserializeBigNumber({s: 1, e: 1, c: [23, 40000000000000]}), new BigNumber(23.4))
})

it('converts BigNumber to number correctly', () => {
  assert.equal(bigToNumber(new BigNumber(1.2345)), 1.2345)
})
