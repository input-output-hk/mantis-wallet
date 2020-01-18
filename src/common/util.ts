import Big from 'big.js'
import {BigNumberJSON} from '../web3'

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
