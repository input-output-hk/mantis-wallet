import {assert} from 'chai'
import {some, none} from 'fp-ts/lib/Option'
import BigNumber from 'bignumber.js'
import {
  deserializeBigNumber,
  validateAmount,
  isGreaterOrEqual,
  validateEthAddress,
  toHex,
  bigSum,
  bech32toHex,
  hexToBech32,
  isLowerOrEqual,
  areFundsEnough,
  createTransparentAddressValidator,
  createConfidentialAddressValidator,
  returnDataToHumanReadable,
  optionHasValue,
  ValidationResult,
  utf8Length,
} from './util'
import {BigNumberJSON} from '../web3'
import {UNITS} from './units'

const toDust = (v: BigNumber.Value): BigNumber => UNITS.Dust.toBasic(new BigNumber(v))

it('deserializes BigNumber correctly', () => {
  ;[2, -2, 2.3, 23.4].map((n: number): void => {
    const bigNum = new BigNumber(n)
    const {s, e, c} = bigNum
    assert.deepEqual(deserializeBigNumber({s, e, c} as BigNumberJSON), bigNum)
  })
})

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
  assert.deepEqual(validateAmount('0.000000001'), {
    tKey: ['common', 'error', 'atMostDecimalPlacesArePermitted'],
    options: {count: 8},
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
  assert.equal(validateAmount('5', [areFundsEnough(toDust(5))]), 'OK')
  assert.deepEqual(validateAmount('5.1', [areFundsEnough(toDust(5))]), {
    tKey: ['wallet', 'error', 'insufficientFunds'],
  })
})

it('sums bignumbers', () => {
  assert.equal(bigSum([new BigNumber(1), new BigNumber(2)]).toString(), '3')
  assert.equal(bigSum([new BigNumber(1)]).toString(), '1')
  assert.equal(bigSum([]).toString(), '0')
})

const bech32TestData = [
  {
    address: '0x442dd636c18ff62294ec772ceab51d0a9cb975bf',
    testnetBech32: 'm-test-uns-ad1gskavdkp3lmz998vwukw4dgap2wtjadlj3vy4e',
    mainnnetBech32: 'm-main-uns-ad1gskavdkp3lmz998vwukw4dgap2wtjadlezszc3',
  },
  {
    address: '0x0480747b7368466f443ff3e0b04e6de9fd45f033',
    testnetBech32: 'm-test-uns-ad1qjq8g7mndprx73pl70stqnnda875tupnsph4uh',
    mainnnetBech32: 'm-main-uns-ad1qjq8g7mndprx73pl70stqnnda875tupnmjtn3l',
  },
  {
    address: '0xfeb8141faf4d4dc2779ca68b84bbacb2c595f47e',
    testnetBech32: 'm-test-uns-ad1l6upg8a0f4xuyauu569cfwavktzetar7292syq',
    mainnnetBech32: 'm-main-uns-ad1l6upg8a0f4xuyauu569cfwavktzetar7pkkkfg',
  },
  {
    address: '0xa14b84de31cb57678c0efc9b0a04cc7b69c1649e',
    testnetBech32: 'm-test-uns-ad1599cfh33edtk0rqwljds5pxv0d5uzey7c4dp7f',
    mainnnetBech32: 'm-main-uns-ad1599cfh33edtk0rqwljds5pxv0d5uzey7nx38np',
  },
  {
    address: '0xa4a510dfd85e767407b6de6329a1f0d664c57284',
    testnetBech32: 'm-test-uns-ad15jj3ph7ctem8gpakme3jng0s6ejv2u5yyzlz86',
    mainnnetBech32: 'm-main-uns-ad15jj3ph7ctem8gpakme3jng0s6ejv2u5y03ry2j',
  },
  {
    address: '0x5a2fb79e5cb0684aaaa4813ebd6db411be1e99d5',
    testnetBech32: 'm-test-uns-ad1tghm08jukp5y424ysylt6md5zxlpaxw4dw5e2e',
    mainnnetBech32: 'm-main-uns-ad1tghm08jukp5y424ysylt6md5zxlpaxw4xagl83',
  },
  {
    address: '0x4b1f4d4c9a92f5764da8c25d44ccb30fd2d9c7ea',
    testnetBech32: 'm-test-uns-ad1fv056ny6jt6hvndgcfw5fn9nplfdn3l2q0ssae',
    mainnnetBech32: 'm-main-uns-ad1fv056ny6jt6hvndgcfw5fn9nplfdn3l2tuvks3',
  },
  {
    address: '0xf22d8a555f9288ff7cd93ea65c67232042fa4142',
    testnetBech32: 'm-test-uns-ad17gkc542lj2y07lxe86n9ceerypp05s2zqzj72t',
    mainnnetBech32: 'm-main-uns-ad17gkc542lj2y07lxe86n9ceerypp05s2zt3wc8r',
  },
  {
    address: '0x997385244e2353f7cbaa345ab2fe27f70f72417c',
    testnetBech32: 'm-test-uns-ad1n9ec2fzwydfl0ja2x3dt9l387u8hystuv7957s',
    mainnnetBech32: 'm-main-uns-ad1n9ec2fzwydfl0ja2x3dt9l387u8hystu8dejnc',
  },
  {
    address: '0x321368abe0c01fb0aaf4a9e9feaf5a94bc741582',
    testnetBech32: 'm-test-uns-ad1xgfk32lqcq0mp2h5485lat66jj78g9vzfrd3gu',
    mainnnetBech32: 'm-main-uns-ad1xgfk32lqcq0mp2h5485lat66jj78g9vzzs3h95',
  },
  {
    address: '0x90bccd6da9742d7376011cd37ea26ed0c3da95b7',
    testnetBech32: 'm-test-uns-ad1jz7v6mdfwskhxasprnfhagnw6rpa49dhqx0qxx',
    mainnnetBech32: 'm-main-uns-ad1jz7v6mdfwskhxasprnfhagnw6rpa49dht4nxtw',
  },
  {
    address: '0xbddf4289efc9a3689446a87b6ac15edd1947f96c',
    testnetBech32: 'm-test-uns-ad1hh059z00ex3k39zx4pak4s27m5v507tvqhsy9r',
    mainnnetBech32: 'm-main-uns-ad1hh059z00ex3k39zx4pak4s27m5v507tvtyvzgt',
  },
  {
    address: '0xd71e5b0ee69cd7f723489fd396e6f571daec3758',
    testnetBech32: 'm-test-uns-ad16u09krhxnntlwg6gnlfedeh4w8dwcd6ckfuj0e',
    mainnnetBech32: 'm-main-uns-ad16u09krhxnntlwg6gnlfedeh4w8dwcd6ca6q5z3',
  },
  {
    address: '0x478bef3b83c846023714258aef068208d43abd73',
    testnetBech32: 'm-test-uns-ad1g7977wureprqydc5yk9w7p5zpr2r40tnt5ek96',
    mainnnetBech32: 'm-main-uns-ad1g7977wureprqydc5yk9w7p5zpr2r40tnq89sgj',
  },
  {
    address: '0xa16fd9631b6e1dfee819a1ac988a7bd8fb4ee869',
    testnetBech32: 'm-test-uns-ad159hajccmdcwla6qe5xkf3znmmra5a6rfylq4d2',
    mainnnetBech32: 'm-main-uns-ad159hajccmdcwla6qe5xkf3znmmra5a6rf0vunqz',
  },
  {
    address: '0x77f4360bf2d8dec3962e4d2e7486c9a4881eb4cf',
    testnetBech32: 'm-test-uns-ad1wl6rvzljmr0v893wf5h8fpkf5jypadx0988zqd',
    mainnnetBech32: 'm-main-uns-ad1wl6rvzljmr0v893wf5h8fpkf5jypadx0w5myd9',
  },
  {
    address: '0x062e1113cb7a8c2bd05103737c38e678fea5b29c',
    testnetBech32: 'm-test-uns-ad1qchpzy7t02xzh5z3qdehcw8x0rl2tv5uwslh7l',
    mainnnetBech32: 'm-main-uns-ad1qchpzy7t02xzh5z3qdehcw8x0rl2tv5u9rr3nh',
  },
  {
    address: '0x068185822bbc3c99c7cde65bd3a533884775e223',
    testnetBech32: 'm-test-uns-ad1q6qctq3ths7fn37dueda8ffn3prhtc3r4ylvuu',
    mainnnetBech32: 'm-main-uns-ad1q6qctq3ths7fn37dueda8ffn3prhtc3r7hr235',
  },
  {
    address: '0x3e29f4ca1221f8b7c8dc3cc3d572675811bc0f0f',
    testnetBech32: 'm-test-uns-ad18c5lfjsjy8ut0jxu8npa2un8tqgmcrc0ffzjre',
    mainnnetBech32: 'm-main-uns-ad18c5lfjsjy8ut0jxu8npa2un8tqgmcrc0z675w3',
  },
  {
    address: '0xeced71476d3b0fbc00c38884640efd6d6a92b0da',
    testnetBech32: 'm-test-uns-ad1ankhz3md8v8mcqxr3zzxgrhad44f9vx6rt4y4h',
    mainnnetBech32: 'm-main-uns-ad1ankhz3md8v8mcqxr3zzxgrhad44f9vx6gcfzcl',
  },
]

it('converts bech32 address to hex', () => {
  bech32TestData.forEach(({address, testnetBech32, mainnnetBech32}) => {
    assert.equal(bech32toHex(testnetBech32), address)
    assert.equal(bech32toHex(mainnnetBech32), address)
  })
  assert.equal(
    bech32toHex('m-test-uns-ad1qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqukkvrke'),
    '0x000000000000000000000000000000000000001c',
  )
})

it('converts hex address to bech32', () => {
  bech32TestData.forEach(({address, testnetBech32, mainnnetBech32}) => {
    assert.equal(hexToBech32(address), testnetBech32)
    assert.equal(hexToBech32(address, 'm-main-uns-ad'), mainnnetBech32)
  })
  assert.equal(hexToBech32('0x1c'), 'm-test-uns-ad1qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqukkvrke')
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
  assert.deepEqual(validateEthAddress(''), {tKey: ['glacierDrop', 'error', 'ethAddressMustBeSet']})
  assert.deepEqual(validateEthAddress('foobar'), {
    tKey: ['glacierDrop', 'error', 'invalidEthAddress'],
  })
})

it('validates addresses correctly', async () => {
  const validateTransparentOnTestnet = (v?: string): ValidationResult =>
    createTransparentAddressValidator('testnet')(v)
  const validateTransparentOnMainnet = (v?: string): ValidationResult =>
    createTransparentAddressValidator('mainnet')(v)
  const validateConfidentialOnTestnet = (v?: string): ValidationResult =>
    createConfidentialAddressValidator('testnet')(v)

  assert.notEqual(validateTransparentOnTestnet(), 'OK', 'Empty string is invalid')
  assert.notEqual(
    validateTransparentOnTestnet('any-non-address-string'),
    'OK',
    'Non address string is invalid',
  )
  assert.notEqual(
    validateTransparentOnTestnet(
      'm-test-shl-ad100hqhl0uks8tneln0z7rzfd962p84v3uk22grrzqh48laq53pugqjjymwyed9twecujgw7jdvy5',
    ),
    'OK',
    'Confidential address for transparent is invalid',
  )
  assert.notEqual(
    validateTransparentOnTestnet('m-main-uns-ad1ankhz3md8v8mcqxr3zzxgrhad44f9vx6gcfzcl'),
    'OK',
    'Transparent mainnet address for testnet is rejected',
  )

  assert.notEqual(
    validateTransparentOnMainnet('m-test-uns-ad1ankhz3md8v8mcqxr3zzxgrhad44f9vx6rt4y4h'),
    'OK',
    'Transparent testnet address for mainnet is rejected',
  )

  assert.notEqual(validateConfidentialOnTestnet(), 'OK', 'Empty string is invalid')
  assert.notEqual(
    validateConfidentialOnTestnet('any-non-address-string'),
    'OK',
    'Invalid address for confidential is rejected',
  )
  assert.notEqual(
    validateConfidentialOnTestnet('m-main-uns-ad1ankhz3md8v8mcqxr3zzxgrhad44f9vx6gcfzcl'),
    'OK',
    'Transparent address for confidential is invalid',
  )

  assert.equal(
    validateTransparentOnTestnet('m-test-uns-ad1ankhz3md8v8mcqxr3zzxgrhad44f9vx6rt4y4h'),
    'OK',
  )
  assert.equal(
    validateTransparentOnMainnet('m-main-uns-ad1ankhz3md8v8mcqxr3zzxgrhad44f9vx6gcfzcl'),
    'OK',
  )
  assert.equal(
    validateConfidentialOnTestnet(
      'm-test-shl-ad100hqhl0uks8tneln0z7rzfd962p84v3uk22grrzqh48laq53pugqjjymwyed9twecujgw7jdvy5',
    ),
    'OK',
  )
})

it('optionHasValue works correctly', () => {
  assert.equal(optionHasValue(some(1), 1), true)
  assert.equal(optionHasValue(some({foo: {bar: 'baz'}}), {foo: {bar: 'baz'}}), true)
  assert.equal(optionHasValue(some(2), 1), false)
  assert.equal(optionHasValue(some({foo: {bar: 'wrong'}}), {foo: {bar: 'baz'}}), false)
  assert.equal(optionHasValue(none, 1), false)
})

it('returns correct utf-8 length', () => {
  assert.equal(utf8Length('hello world'), 11)
  assert.equal(utf8Length('🦇'), 4)
  assert.equal(utf8Length('szélütött űrújságírónő'), 31)
  assert.equal(utf8Length('Päťtýždňové vĺčatá nervózne štekajú na môjho ďatľa v tŕní'), 74)
  assert.equal(
    utf8Length(
      'กรุงเทพมหานคร อมรรัตนโกสินทร์ มหินทรายุธยา มหาดิลกภพ นพรัตนราชธานีบูรีรมย์ อุดมราชนิเวศน์มหาสถาน อมรพิมานอวตารสถิต สักกะทัตติยวิษณุกรรมประสิทธิ์',
    ),
    418,
  )
  assert.equal(utf8Length('日本'), 6)
})
