import {abbreviateNumber, formatPercentage} from './formatters'
import {assert} from 'chai'

it('abbreviates numbers correctly', () => {
  assert.equal(abbreviateNumber(12.5), '12.5')
  assert.equal(abbreviateNumber(100), '100')
  assert.equal(abbreviateNumber(1001), '1001')
  assert.equal(abbreviateNumber(10001), '10001')
  assert.equal(abbreviateNumber(100001), '100001')
  assert.equal(abbreviateNumber(1000 * 1000), '1M')
  assert.equal(abbreviateNumber(1000 * 1000 * 1000), '1G')
  assert.equal(abbreviateNumber(1000 * 1000 * 1000 * 1000), '1T')
})

it('formats percentage correctly', () => {
  assert.equal(formatPercentage(0.99999), '100')
  assert.equal(formatPercentage(0.9999), '99.99')
  assert.equal(formatPercentage(0.0001), '0.01')
  assert.equal(formatPercentage(0.00005), '0.01')
  assert.equal(formatPercentage(0.000049), '0')
  assert.equal(formatPercentage(0.1), '10')
})
