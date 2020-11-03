import {assert} from 'chai'
import {some, none} from 'fp-ts/lib/Option'
import BigNumber from 'bignumber.js'
import {
  validateAmount,
  isGreaterOrEqual,
  validateEthAddress,
  validateEthPrivateKey,
  toHex,
  bigSum,
  isLowerOrEqual,
  areFundsEnough,
  returnDataToHumanReadable,
  optionHasValue,
} from './util'
import {asEther} from './units'

it('validates amount correctly', () => {
  assert.deepEqual(validateAmount('x'), {
    tKey: ['common', 'error', 'mustBeANumberGreaterThan'],
    options: {replace: {minValue: 0}},
  })
  assert.deepEqual(validateAmount('-1'), {
    tKey: ['common', 'error', 'mustBeANumberGreaterThan'],
    options: {replace: {minValue: 0}},
  })
  assert.deepEqual(validateAmount('0'), {
    tKey: ['common', 'error', 'mustBeANumberGreaterThan'],
    options: {replace: {minValue: 0}},
  })
  assert.deepEqual(validateAmount('0.0000000000000000001'), {
    tKey: ['common', 'error', 'atMostDecimalPlacesArePermitted'],
    options: {count: 18},
  })
  assert.equal(validateAmount('0.00000001'), 'OK')
  assert.equal(validateAmount('0.000001'), 'OK')
  assert.equal(validateAmount('24323423.345141'), 'OK')
  assert.equal(validateAmount('342423'), 'OK')
  assert.equal(validateAmount('5', [isGreaterOrEqual(5)]), 'OK')
  assert.deepEqual(validateAmount('4.99', [isGreaterOrEqual(5)]), {
    tKey: ['common', 'error', 'mustBeAtLeast'],
    options: {replace: {minValue: 5}},
  })
  assert.equal(validateAmount('5', [isLowerOrEqual(5)]), 'OK')
  assert.deepEqual(validateAmount('5.1', [isLowerOrEqual(5)]), {
    tKey: ['common', 'error', 'mustBeAtMost'],
    options: {replace: {maxValue: 5}},
  })
  assert.equal(validateAmount('5', [areFundsEnough(asEther(5))]), 'OK')
  assert.deepEqual(validateAmount('5.1', [areFundsEnough(asEther(5))]), {
    tKey: ['wallet', 'error', 'insufficientFunds'],
  })
})

it('sums bignumbers', () => {
  assert.equal(bigSum([new BigNumber(1), new BigNumber(2)]).toString(), '3')
  assert.equal(bigSum([new BigNumber(1)]).toString(), '1')
  assert.equal(bigSum([]).toString(), '0')
})

it('converts number/BigNumber to hex correctly', () => {
  const t = (n: number, expectedResult: string): void => {
    assert.equal(toHex(n), expectedResult)
    assert.equal(toHex(new BigNumber(n)), expectedResult)
  }

  t(0, '0x0')
  t(1, '0x1')
  t(15, '0xf')
  t(16, '0x10')
  t(100000, '0x186a0')
  assert.throw(() => toHex(-1))
})

it('converts contract return data to human-readable ASCII', () => {
  const testReturnData =
    '08c379a00000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000001c5472616e73666572206f662077697468647261776e206661696c656400000000'
  const expectedMsg = 'Transfer of withdrawn failed'

  // Without 0x prefix
  assert.equal(returnDataToHumanReadable(testReturnData), expectedMsg)

  // With 0x prefix
  assert.equal(returnDataToHumanReadable(`0x${testReturnData}`), expectedMsg)

  // Extra testcase
  const testReturnData2 =
    '0x08c379a00000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000001f496e76616c696420617574686f72697a6174696f6e207369676e617475726500'
  const expectedMsg2 = 'Invalid authorization signature'
  assert.equal(returnDataToHumanReadable(testReturnData2), expectedMsg2)
})

it('validates ethereum address', () => {
  assert.equal(validateEthAddress('0x5749EB6A6D6Aebef98880f0712b60abFd97e0eC7'), 'OK')
  assert.deepEqual(validateEthAddress(''), {tKey: ['common', 'error', 'ethAddressMustBeSet']})
  assert.deepEqual(validateEthAddress('foobar'), {
    tKey: ['common', 'error', 'invalidEthAddress'],
  })
})

it('validates ethereum private key', () => {
  assert.equal(
    validateEthPrivateKey('0x8da4ef21b864d2cc526dbdb2a120bd2874c36c9d0a1fb7f8c63d7f7a8b41de8f'),
    'OK',
  )
  assert.equal(
    validateEthPrivateKey('8da4ef21b864d2cc526dbdb2a120bd2874c36c9d0a1fb7f8c63d7f7a8b41de8f'),
    'OK',
  )
  assert.deepEqual(validateEthPrivateKey(''), {tKey: ['common', 'error', 'ethPrivateKeyMustBeSet']})
  assert.deepEqual(validateEthPrivateKey('foobar'), {
    tKey: ['common', 'error', 'invalidEthPrivateKey'],
  })
})

it('optionHasValue works correctly', () => {
  assert.equal(optionHasValue(some(1), 1), true)
  assert.equal(optionHasValue(some({foo: {bar: 'baz'}}), {foo: {bar: 'baz'}}), true)
  assert.equal(optionHasValue(some(2), 1), false)
  assert.equal(optionHasValue(some({foo: {bar: 'wrong'}}), {foo: {bar: 'baz'}}), false)
  assert.equal(optionHasValue(none, 1), false)
})
