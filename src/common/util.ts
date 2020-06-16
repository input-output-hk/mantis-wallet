import * as Comlink from 'comlink'
import BigNumber from 'bignumber.js'
import * as bech32 from 'bech32-buffer'
import _ from 'lodash'
import fileSize from 'filesize'
import {Rule} from 'antd/lib/form'
import {StoreValue} from 'antd/lib/form/interface'
import {BigNumberJSON, PaginatedCallable} from '../web3'
import {UnitType, UNITS} from './units'
import {NETWORK_CONSTANTS} from '../shared/version'

export function deserializeBigNumber(json: BigNumberJSON): BigNumber {
  return new BigNumber({_isBigNumber: true, ...json})
}

export const toHex = (n: number | BigNumber): string => {
  const asString = n.toString(16)
  if (asString.startsWith('-')) throw Error('n must be positive')
  return `0x${asString}`
}

const HASHRATE_SUFFIX = ['hash/s', 'kH/s', 'MH/s', 'GH/s', 'TH/s', 'PH/s', 'EH/s', 'ZH/s', 'YH/s']

export function toHumanReadableHashrate(hashrate: number): string {
  if (hashrate < 0) return 'Invalid hashrate'
  return fileSize(hashrate, {fullform: true, fullforms: HASHRATE_SUFFIX})
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

export const isLess = (minValue = 0) => (b: BigNumber) =>
  !b.isFinite() || !b.isLessThan(new BigNumber(minValue))
    ? `Must be a number less than ${minValue}`
    : ''

export const isGreater = (minValue = 0) => (b: BigNumber) =>
  !b.isFinite() || !b.isGreaterThan(new BigNumber(minValue))
    ? `Must be a number greater than ${minValue}`
    : ''

export const isGreaterOrEqual = (minValue: BigNumber.Value = 0) => (b: BigNumber) =>
  !b.isFinite() || !b.isGreaterThanOrEqualTo(new BigNumber(minValue))
    ? `Must be at least ${minValue.toString(10)}`
    : ''

export const isLowerOrEqual = (maxValue: BigNumber.Value, message?: string) => (b: BigNumber) =>
  !b.isFinite() || !b.isLessThanOrEqualTo(new BigNumber(maxValue))
    ? message || `Must be at most ${maxValue.toString(10)}`
    : ''

export const areFundsEnough = (
  funds: BigNumber,
  unit: UnitType = 'Dust',
): ReturnType<typeof isLowerOrEqual> =>
  isLowerOrEqual(UNITS[unit].fromBasic(funds), 'Insufficient funds')

const hasAtMostDecimalPlacesMessage = (dp: number): string =>
  dp === 0 ? 'It must be an integer value' : `At most ${dp} decimal places are permitted`

export const hasAtMostDecimalPlaces = (dp = 8) => (b: BigNumber) =>
  b.dp() > dp ? hasAtMostDecimalPlacesMessage(dp) : ''

export function validateAmount(
  v: string,
  validators: Array<(b: BigNumber) => string> = [isGreater(), hasAtMostDecimalPlaces()],
): string {
  const b = new BigNumber(v)
  return validators.reduce((acc, cur) => (acc !== '' ? acc : cur(b)), '')
}

export function validateTxAmount(amount: string, availableAmount: BigNumber): string {
  return validateAmount(amount, [
    isGreater(),
    areFundsEnough(availableAmount),
    hasAtMostDecimalPlaces(),
  ])
}

export function validateFee(fee: string): string {
  return validateAmount(fee, [isGreaterOrEqual(), hasAtMostDecimalPlaces()])
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

const ETC_ADDRESS_REGEX = new RegExp('^0x[a-fA-F0-9]{40}$')

export const EMPTY_ADDRESS_MSG = 'Address must be set'
export const INVALID_ADDRESS_MSG = 'Invalid address'

export function validateEthAddress(rawInput?: string): string {
  if (rawInput == null || rawInput.length === 0) return EMPTY_ADDRESS_MSG
  // Note: use isChecksumAddress for checksum check
  if (!ETC_ADDRESS_REGEX.test(rawInput)) return INVALID_ADDRESS_MSG
  return ''
}

const MAX_KEY_VALUE = new BigNumber(
  '0xfffffffffffffffffffffffffffffffebaaedce6af48a03bbfd25e8cd0364141',
)
export const PRIVATE_KEY_INVALID_MSG = 'Invalid private key'
export const PRIVATE_KEY_MUST_BE_SET_MSG = 'Private Key must be set'

export function validateEthPrivateKey(privateKey?: string): string {
  if (privateKey == null || privateKey.length === 0) {
    return PRIVATE_KEY_MUST_BE_SET_MSG
  }
  try {
    const k = new BigNumber(privateKey)
    if (!k.isFinite() || k.isZero() || k.isGreaterThan(MAX_KEY_VALUE)) {
      return PRIVATE_KEY_INVALID_MSG
    }
  } catch (e) {
    return PRIVATE_KEY_INVALID_MSG
  }
  return ''
}

type AntValidator = {
  validator: (rule: Rule, value: StoreValue) => Promise<void>
}

export function toAntValidator(validate: (value?: string) => string): AntValidator {
  return {
    validator: (_rule, value) => {
      const possibleError = validate(value)
      return possibleError === '' ? Promise.resolve() : Promise.reject(possibleError)
    },
  }
}

export const createTxAmountValidator = (availableAmount: BigNumber): AntValidator =>
  toAntValidator((amount?: string): string => validateTxAmount(amount || '', availableAmount))

const createAddressValidator = (
  prefix: string,
  length: number,
  message = 'Invalid address',
): AntValidator => ({
  validator: (_rule: Rule, value?: string): Promise<void> => {
    if (!value) {
      return Promise.reject('Address must be set')
    }
    try {
      const decoded = bech32.decode(value)
      if (prefix !== decoded.prefix || decoded.data.length !== length) {
        return Promise.reject(message)
      }
    } catch (e) {
      return Promise.reject(message)
    }

    return Promise.resolve()
  },
})

export const createTransparentAddressValidator = (networkTag: NetworkTag): AntValidator => {
  const prefix = `m-${NETWORK_CONSTANTS[networkTag].shortTag}-uns-ad`
  return createAddressValidator(prefix, 20, 'Invalid transparent address')
}

export const createConfidentialAddressValidator = (networkTag: NetworkTag): AntValidator => {
  const prefix = `m-${NETWORK_CONSTANTS[networkTag].shortTag}-shl-ad`
  return createAddressValidator(prefix, 43, 'Invalid confidential address')
}
