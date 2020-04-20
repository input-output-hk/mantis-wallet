// eslint-disable-next-line @typescript-eslint/no-unused-vars
import * as t from 'io-ts'
import {assert} from 'chai'
import {right, isLeft} from 'fp-ts/lib/Either'
import BigNumber from 'bignumber.js'
import {BigNumberFromHexString, SignatureParamCodec} from './io-helpers'

it('BigNumberFromHexString deserializes hex strings into BigNumbers', () =>
  ['0x0', '0x1', '0x123', '0xFFF'].forEach((input) => {
    assert.deepEqual(BigNumberFromHexString.decode(input), right(new BigNumber(input)))
  }))

it('BigNumberFromHexString rejects invalid hex numbers', () =>
  ['123', 'foobar'].forEach((input) => assert(isLeft(BigNumberFromHexString.decode(input)))))

it('SignatureParamCodec pads signatures correctly ', () => {
  assert.deepEqual(
    SignatureParamCodec.decode('0x11111'),
    right('0x0000000000000000000000000000000000000000000000000000000000011111'),
  )
})

it('SignatureParamCodec rejects too long signatures ', () => {
  assert(
    isLeft(
      SignatureParamCodec.decode(
        '0x00000000000000000000000000000000000000000000000000000000000111111',
      ),
    ),
  )
})
