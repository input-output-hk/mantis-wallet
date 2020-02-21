import * as Comlink from 'comlink'
import BigNumber from 'bignumber.js'
import {BigNumberJSON, PaginatedCallable} from '../web3'

export function deserializeBigNumber(json: BigNumberJSON): BigNumber {
  return new BigNumber({_isBigNumber: true, ...json})
}

export function bigToNumber(bigNumber: BigNumber): number {
  return parseFloat(bigNumber.toFixed(10))
}

export function hasMaxDecimalPlaces(bigNumber: BigNumber, decimalPlaces: number): boolean {
  const mod = new BigNumber(`0.${''.padStart(decimalPlaces - 1, '0')}1`)
  return bigNumber.modulo(mod).isZero()
}

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

export function validateAmount(v: string): string {
  const n = new BigNumber(v)

  if (!n.isFinite() || !n.isGreaterThan(new BigNumber(0))) {
    return 'Must be a number greater than 0'
  } else if (!hasMaxDecimalPlaces(n, 6)) {
    return 'At most 6 decimal places are permitted'
  } else {
    return ''
  }
}
