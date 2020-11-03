import BigNumber from 'bignumber.js'
import {Branded} from 'io-ts'
import {ETC_CHAIN} from './chains'

export type Wei = Branded<BigNumber, 'wei'>

export function asEther(v: BigNumber.Value): Wei {
  return new BigNumber(v).shiftedBy(ETC_CHAIN.decimals) as Wei
}

export function asWei(v: BigNumber.Value): Wei {
  return new BigNumber(v) as Wei
}

export function etherValue(wei: Wei): BigNumber {
  return wei.shiftedBy(-ETC_CHAIN.decimals)
}
