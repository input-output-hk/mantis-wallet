import {assert} from 'chai'
import Big from 'big.js'
import {deserializeBigNumber, bigToNumber} from './util'

it('deserializes BigNumber correctly', () => {
  assert.deepEqual(Big(2), deserializeBigNumber({s: 1, e: 0, c: [2]}))
  assert.deepEqual(Big(-2), deserializeBigNumber({s: -1, e: 0, c: [2]}))
  assert.deepEqual(Big(2.3), deserializeBigNumber({s: 1, e: 0, c: [2, 3]}))
  assert.deepEqual(Big(23.4), deserializeBigNumber({s: 1, e: 1, c: [2, 3, 4]}))
})

it('converts Big to number correctly', () => {
  assert.equal(1.2345, bigToNumber(Big(1.2345)))
})
