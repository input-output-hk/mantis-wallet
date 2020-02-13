import {abbreviateNumber, formatPercentage} from './formatters'
import {assert} from 'chai'

it('abbreviates numbers correctly', () => {
  assert.equal('12.5', abbreviateNumber(12.5))
  assert.equal('100', abbreviateNumber(100))
  assert.equal('1001', abbreviateNumber(1001))
  assert.equal('10001', abbreviateNumber(10001))
  assert.equal('100001', abbreviateNumber(100001))
  assert.equal('1M', abbreviateNumber(1000 * 1000))
  assert.equal('1G', abbreviateNumber(1000 * 1000 * 1000))
  assert.equal('1T', abbreviateNumber(1000 * 1000 * 1000 * 1000))
})

it('formats percentage correctly', () => {
  assert.equal('100', formatPercentage(0.99999))
  assert.equal('99.99', formatPercentage(0.9999))
  assert.equal('0.01', formatPercentage(0.0001))
  assert.equal('0.01', formatPercentage(0.00005))
  assert.equal('0', formatPercentage(0.000049))
  assert.equal('10', formatPercentage(0.1))
})
