import BigNumber from 'bignumber.js'
import * as t from 'io-ts'
import {either} from 'fp-ts/lib/Either'

export const BigNumberFromHexString = new t.Type<BigNumber, string>(
  'BigNumberFromHexString',
  (u): u is BigNumber => u instanceof BigNumber,
  (u, c) =>
    either.chain(t.string.validate(u, c), (str) => {
      if (!str.startsWith('0x')) return t.failure(str, c)
      const bigNumber = new BigNumber(str)
      return bigNumber.isFinite() ? t.success(bigNumber) : t.failure(str, c)
    }),
  (a) => a.toString(16),
)

export const NumberFromHexString = new t.Type<number, string>(
  'NumberFromHexString',
  t.number.is,
  (u, c) =>
    either.chain(t.string.validate(u, c), (str) => {
      if (!str.startsWith('0x')) return t.failure(str, c)
      const number = parseInt(str, 16)
      return !isNaN(number) ? t.success(number) : t.failure(str, c)
    }),
  (a) => a.toString(16),
)

export const SignatureParamCodec = new t.Type<string, string>(
  'SignatureParamCodec',
  t.string.is,
  (u, c) =>
    either.chain(t.string.validate(u, c), (str) => {
      if (str.length > 66) return t.failure(str, c)
      if (str.length == 66) return t.success(str)
      return t.success(`0x${str.slice(2).padStart(64, '0')}`)
    }),
  t.identity,
)
