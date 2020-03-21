import {assert} from 'chai'
import BigNumber from 'bignumber.js'
import {deserializeBigNumber, validateAmount} from './util'
import {BigNumberJSON} from '../web3'

it('deserializes BigNumber correctly', () => {
  ;[2, -2, 2.3, 23.4].map((n: number): void => {
    const bigNum = new BigNumber(n)
    const {s, e, c} = bigNum
    assert.deepEqual(deserializeBigNumber({s, e, c} as BigNumberJSON), bigNum)
  })
})

it('validates amount correctly', () => {
  assert.equal(validateAmount('x'), 'Must be a number greater than 0')
  assert.equal(validateAmount('-1'), 'Must be a number greater than 0')
  assert.equal(validateAmount('0'), 'Must be a number greater than 0')
  assert.equal(validateAmount('0.0000001'), 'At most 6 decimal places are permitted')
  assert.equal(validateAmount('0.000001'), '')
  assert.equal(validateAmount('24323423.345141'), '')
  assert.equal(validateAmount('342423'), '')
})
