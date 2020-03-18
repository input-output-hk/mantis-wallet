import {assert} from 'chai'
import BigNumber from 'bignumber.js'
import {abbreviateAmount, formatPercentage, formatAmount} from './formatters'

it('abbreviates numbers correctly', () => {
  const abbreviateBig = (n: number | string): [string, string] => {
    const {relaxed, strict} = abbreviateAmount(new BigNumber(n))
    return [strict, relaxed]
  }
  assert.deepEqual(abbreviateBig('0.0000000123456789'), ['0.0000000123457', '0.0000000123456789'])
  assert.deepEqual(abbreviateBig('0.000123456789'), ['0.000123457', '0.000123456789'])
  assert.deepEqual(abbreviateBig('0.00123456789'), ['0.00123457', '0.00123456789'])
  assert.deepEqual(abbreviateBig('0.0123456789'), ['0.0123457', '0.0123456789'])
  assert.deepEqual(abbreviateBig('0.123456789'), ['0.123457', '0.123456789'])
  assert.deepEqual(abbreviateBig('1.23456789'), ['1.234568', '1.23456789'])
  assert.deepEqual(abbreviateBig('12.3456789'), ['12.34568', '12.3456789'])
  assert.deepEqual(abbreviateBig('123.456789'), ['123.4568', '123.456789'])
  assert.deepEqual(abbreviateBig('1234.56789'), ['1,234.568', '1,234.56789'])
  assert.deepEqual(abbreviateBig('12345.6789'), ['12,345.68', '12,345.6789'])
  assert.deepEqual(abbreviateBig('123456.789'), ['123,456.79', '123,456.789'])
  assert.deepEqual(abbreviateBig('1234567.89'), ['1,234,567.89', '1,234,567.89'])
  assert.deepEqual(abbreviateBig('12345678.9'), ['12,345,678.90', '12,345,678.90'])
  assert.deepEqual(abbreviateBig('123456789'), ['123,456,789.00', '123,456,789.00'])
  assert.deepEqual(abbreviateBig('1234567890'), ['1,234,567,890.00', '1,234,567,890.00'])
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
