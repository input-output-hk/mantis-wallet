import {abbreviateAmount, formatPercentage, formatAmount} from './formatters'
import {assert} from 'chai'
import BigNumber from 'bignumber.js'

it('abbreviates numbers correctly', () => {
  const abbreviateBig = (n: number): string => abbreviateAmount(new BigNumber(n))
  assert.equal(abbreviateBig(12.5), '12.5')
  assert.equal(abbreviateBig(100), '100')
  assert.equal(abbreviateBig(1001), '1,001')
  assert.equal(abbreviateBig(10001), '10,001')
  assert.equal(abbreviateBig(100001), '100,001')
  assert.equal(abbreviateBig(1000 * 1000), '1M')
  assert.equal(abbreviateBig(1000 * 1000 * 1000), '1G')
  assert.equal(abbreviateBig(1000 * 1000 * 1000 * 1000), '1T')
  assert.equal(abbreviateBig(0.1), '0.1')
  assert.equal(abbreviateBig(0.001), '1m')
  assert.equal(abbreviateBig(0.008), '0.008')
  assert.equal(abbreviateBig(1 / 1000 / 1000), '1μ')
})

it('formats amount correctly', () => {
  const bigNum = new BigNumber(1.234567)
  assert.equal(formatAmount(bigNum), '1.234567')
  assert.equal(formatAmount(bigNum, 3), '1.235')
  assert.equal(formatAmount(bigNum, 4, 'strict'), '1.2346')
  assert.equal(formatAmount(bigNum, 4, 'relaxed'), '1.234567')
})

it('formats percentage correctly', () => {
  assert.equal(formatPercentage(0.99999), '100')
  assert.equal(formatPercentage(0.9999), '99.99')
  assert.equal(formatPercentage(0.0001), '0.01')
  assert.equal(formatPercentage(0.00005), '0.01')
  assert.equal(formatPercentage(0.000049), '0')
  assert.equal(formatPercentage(0.1), '10')
})
