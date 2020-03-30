import * as Comlink from 'comlink'
import BigNumber from 'bignumber.js'
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

export function validateAmount(v: string): string {
  const n = new BigNumber(v)

  if (!n.isFinite() || !n.isGreaterThan(new BigNumber(0))) {
    return 'Must be a number greater than 0'
  } else if (n.dp() > 8) {
    return 'At most 8 decimal places are permitted'
  } else {
    return ''
  }
}
