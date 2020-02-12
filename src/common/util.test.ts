import {assert} from 'chai'
import Big from 'big.js'
import {deserializeBigNumber, bigToNumber} from './util'

it('deserializes BigNumber correctly', () => {
  assert.deepEqual(deserializeBigNumber({s: 1, e: 0, c: [2]}), Big(2))
  assert.deepEqual(deserializeBigNumber({s: -1, e: 0, c: [2]}), Big(-2))
  assert.deepEqual(deserializeBigNumber({s: 1, e: 0, c: [2, 3]}), Big(2.3))
  assert.deepEqual(deserializeBigNumber({s: 1, e: 1, c: [2, 3, 4]}), Big(23.4))
})

it('converts Big to number correctly', () => {
  assert.equal(bigToNumber(Big(1.2345)), 1.2345)
})
