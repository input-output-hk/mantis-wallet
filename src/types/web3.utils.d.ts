declare module 'web3/lib/utils/utils.js' {
  import {BigNumber} from 'bignumber.js'

  export function fromWei<T = BigNumber | string>(number: T): T

  export function toWei<T = BigNumber | string>(number: T): T

  export function isChecksumAddress(rawInput: string): boolean

  export function toAscii(hex: string): string
}
