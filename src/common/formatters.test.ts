import {assert} from 'chai'
import BigNumber from 'bignumber.js'
import {enUS} from 'date-fns/locale'
import {abbreviateAmount, formatPercentage, formatAmount, formatDate} from './formatters'
import {EN_US_BIG_NUMBER_FORMAT} from './i18n'

it('abbreviates numbers correctly', () => {
  const abbreviateBig = (n: number | string): [string, string] => {
    const {relaxed, strict} = abbreviateAmount(new BigNumber(n), EN_US_BIG_NUMBER_FORMAT)
    return [strict, relaxed]
  }
  assert.deepEqual(abbreviateBig('0.00000001'), ['0.00000001', '0.00000001'])
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
  assert.deepEqual(abbreviateBig('123456789.000021'), ['123,456,789.00', '123,456,789.000021'])
  assert.deepEqual(abbreviateBig('-123456789.000021'), ['-123,456,789.00', '-123,456,789.000021'])
})

it('formats amount correctly', () => {
  const bigNum = new BigNumber(1.234567)
  assert.equal(formatAmount(bigNum, 3, 'strict', EN_US_BIG_NUMBER_FORMAT), '1.235')
  assert.equal(formatAmount(bigNum, 4, 'strict', EN_US_BIG_NUMBER_FORMAT), '1.2346')
  assert.equal(formatAmount(bigNum, 4, 'relaxed', EN_US_BIG_NUMBER_FORMAT), '1.234567')
  assert.equal(formatAmount(bigNum, 0, 'relaxed', EN_US_BIG_NUMBER_FORMAT), '1.234567')
  assert.equal(formatAmount(bigNum, 10, 'relaxed', EN_US_BIG_NUMBER_FORMAT), '1.2345670000')
})

it('formats percentage correctly', () => {
  const enUSNumberFormat = new Intl.NumberFormat('en-US')

  assert.equal(formatPercentage(0.99999, enUSNumberFormat), '100')
  assert.equal(formatPercentage(0.9999, enUSNumberFormat), '99.99')
  assert.equal(formatPercentage(0.0001, enUSNumberFormat), '0.01')
  assert.equal(formatPercentage(0.00005, enUSNumberFormat), '0.01')
  assert.equal(formatPercentage(0.000049, enUSNumberFormat), '0')
  assert.equal(formatPercentage(0.1, enUSNumberFormat), '10')
})

it('formats date correctly', () => {
  const date = new Date('19 Jul 1994 6:12:00')
  assert.equal(formatDate(date, 'MM/DD/YYYY', '12-hour', enUS), '07/19/1994, 6:12 AM')
  assert.equal(formatDate(date, 'YYYY-MM-DD', '24-hour', enUS), '1994-07-19, 6:12')
  assert.equal(formatDate(date, 'DD/MM/YYYY', '24-hour', enUS), '19/07/1994, 6:12')
  assert.equal(formatDate(date, 'DD-MM-YYYY', '24-hour', enUS), '19-07-1994, 6:12')
})
