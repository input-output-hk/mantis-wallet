import * as Comlink from 'comlink'
import BigNumber from 'bignumber.js'
import * as bech32 from 'bech32-buffer'
import _ from 'lodash'
import {BigNumberJSON, PaginatedCallable} from '../web3'

export function deserializeBigNumber(json: BigNumberJSON): BigNumber {
  return new BigNumber({_isBigNumber: true, ...json})
}

export const toHex = (n: number): string => `0x${n.toString(16)}`

export const loadAll = async <T>(
  fn: Comlink.Remote<PaginatedCallable<T>>,
  drop = 0,
): Promise<T[]> => {
  const result = await fn(100, drop)
  if (result.length !== 100) {
    return result
  } else {
    const nextResult = await loadAll(fn, drop + 100)
    return [...result, ...nextResult]
  }
}

export const isGreater = (minValue = 0) => (b: BigNumber) =>
  !b.isFinite() || !b.isGreaterThan(new BigNumber(minValue))
    ? `Must be a number greater than ${minValue}`
    : ''

export const isGreaterOrEqual = (minValue: BigNumber.Value = 0) => (b: BigNumber) =>
  !b.isFinite() || !b.isGreaterThanOrEqualTo(new BigNumber(minValue))
    ? `Must be at least ${minValue.toString(10)}`
    : ''

export const hasAtMostDecimalPlaces = (dp = 8) => (b: BigNumber) =>
  b.dp() > dp ? `At most ${dp} decimal places are permitted` : ''

export function validateAmount(
  v: string,
  validators: Array<(b: BigNumber) => string> = [isGreater(), hasAtMostDecimalPlaces()],
): string {
  const b = new BigNumber(v)
  return validators.reduce((acc, cur) => (acc !== '' ? acc : cur(b)), '')
}

export function bigSum(numbers: BigNumber[]): BigNumber {
  return numbers.reduce((acc, cur) => acc.plus(cur), new BigNumber(0))
}

export function bech32toHex(bech32Address: string): string {
  const decoded = bech32.decode(bech32Address)

  const hex = _.map(decoded.data, (w: number): string => w.toString(16).padStart(2, '0'))

  return `0x${hex.join('')}`
}

export function hexToBech32(hexAddress: string, prefix = 'm-test-uns-ad'): string {
  const getData = (n: BigNumber, retData: number[] = []): number[] =>
    n.isZero() ? retData : getData(n.dividedToIntegerBy(256), [n.mod(256).toNumber(), ...retData])

  const data = getData(new BigNumber(hexAddress))

  const trailingZeros = _.fill(new Array(20 - data.length), 0)

  return bech32.encode(prefix, new Uint8Array([...trailingZeros, ...data]))
}
