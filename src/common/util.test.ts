import {assert} from 'chai'
import BigNumber from 'bignumber.js'
import {deserializeBigNumber, bigToNumber, hasMaxDecimalPlaces} from './util'
import {BigNumberJSON} from '../web3'

it('deserializes BigNumber correctly', () => {
  ;[2, -2, 2.3, 23.4].map((n: number): void => {
    const bigNum = new BigNumber(n)
    const {s, e, c} = bigNum
    assert.deepEqual(deserializeBigNumber({s, e, c} as BigNumberJSON), bigNum)
  })
})

it('converts BigNumber to number correctly', () => {
  assert.equal(bigToNumber(new BigNumber(1.2345)), 1.2345)
})

it('checks maximum decimal places', () => {
  assert.isTrue(hasMaxDecimalPlaces(new BigNumber(1.2345), 5))
  assert.isTrue(hasMaxDecimalPlaces(new BigNumber(1.2345), 4))
  assert.isFalse(hasMaxDecimalPlaces(new BigNumber(1.2345), 3))
})
