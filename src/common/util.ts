import Big from 'big.js'
import {BigNumberJSON, PaginatedCallable} from '../web3'

export function deserializeBigNumber(json: BigNumberJSON): Big {
  const bigNumber = Big(0)
  /* eslint-disable */
  bigNumber.s = json.s
  bigNumber.e = json.e
  bigNumber.c = json.c
  /* eslint-enable */
  return bigNumber
}

export function bigToNumber(bigNumber: Big): number {
  return parseFloat(bigNumber.toFixed(10))
}

export const loadAll = async <T>(fn: PaginatedCallable<T>, drop = 0): Promise<T[]> => {
  const result = await fn(100, drop)
  if (result.length !== 100) {
    return result
  } else {
    const nextResult = await loadAll(fn, drop + 100)
    return [...result, ...nextResult]
  }
}
