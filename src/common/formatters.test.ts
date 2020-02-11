import {abbreviateAmount, formatPercentage, formatAmount} from './formatters'
import {assert} from 'chai'
import BigNumber from 'bignumber.js'

it('abbreviates numbers correctly', () => {
  assert.equal(abbreviateAmount(new BigNumber(12.5)), '12.5')
  assert.equal(abbreviateAmount(new BigNumber(100)), '100')
  assert.equal(abbreviateAmount(new BigNumber(1001)), '1,001')
  assert.equal(abbreviateAmount(new BigNumber(10001)), '10,001')
  assert.equal(abbreviateAmount(new BigNumber(100001)), '100,001')
  assert.equal(abbreviateAmount(new BigNumber(1000 * 1000)), '1M')
  assert.equal(abbreviateAmount(new BigNumber(1000 * 1000 * 1000)), '1G')
  assert.equal(abbreviateAmount(new BigNumber(1000 * 1000 * 1000 * 1000)), '1T')
  assert.equal(abbreviateAmount(new BigNumber(0.1)), '0.1')
  assert.equal(abbreviateAmount(new BigNumber(0.001)), '1m')
  assert.equal(abbreviateAmount(new BigNumber(0.008)), '0.008')
  assert.equal(abbreviateAmount(new BigNumber(1 / 1000 / 1000)), '1μ')
})

it('formats amount correctly', () => {
  assert.equal(formatAmount(new BigNumber(1.234567)), '1.234567')
  assert.equal(formatAmount(new BigNumber(1.234567), 3), '1.235')
})

it('formats percentage correctly', () => {
  assert.equal(formatPercentage(0.99999), '100')
  assert.equal(formatPercentage(0.9999), '99.99')
  assert.equal(formatPercentage(0.0001), '0.01')
  assert.equal(formatPercentage(0.00005), '0.01')
  assert.equal(formatPercentage(0.000049), '0')
  assert.equal(formatPercentage(0.1), '10')
})
