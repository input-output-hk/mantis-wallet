import * as Comlink from 'comlink'
import BigNumber from 'bignumber.js'
import {isAddress} from 'web3-utils'
import _ from 'lodash'
import {elem, Option} from 'fp-ts/lib/Option'
import {fromEquals} from 'fp-ts/lib/Eq'
import {Rule} from 'antd/lib/form'
import {StoreValue} from 'antd/lib/form/interface'
import {PaginatedCallable} from '../web3'
import {Translatable, TFunctionRenderer, createTErrorRenderer} from './i18n'
import {ETC_CHAIN} from './chains'

export type ValidationResult = Translatable | 'OK'

export const toHex = (n: number | BigNumber): string => {
  const asString = n.toString(16)
  if (asString.startsWith('-'))
    throw createTErrorRenderer(['common', 'error', 'numberMustBePositive'])
  return `0x${asString}`
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

export const isLess = (maxValue = 0) => (b: BigNumber): ValidationResult =>
  !b.isFinite() || !b.isLessThan(new BigNumber(maxValue))
    ? {tKey: ['common', 'error', 'mustBeANumberLessThan'], options: {replace: {maxValue}}}
    : 'OK'

export const isGreater = (minValue = 0) => (b: BigNumber): ValidationResult =>
  !b.isFinite() || !b.isGreaterThan(new BigNumber(minValue))
    ? {tKey: ['common', 'error', 'mustBeANumberGreaterThan'], options: {replace: {minValue}}}
    : 'OK'

export const isGreaterOrEqual = (minValue: BigNumber.Value = 0) => (
  b: BigNumber,
): ValidationResult =>
  !b.isFinite() || !b.isGreaterThanOrEqualTo(new BigNumber(minValue))
    ? {tKey: ['common', 'error', 'mustBeAtLeast'], options: {replace: {minValue}}}
    : 'OK'

export const isLowerOrEqual = (maxValue: BigNumber.Value, message?: Translatable) => (
  b: BigNumber,
): ValidationResult =>
  !b.isFinite() || !b.isLessThanOrEqualTo(new BigNumber(maxValue))
    ? message || {tKey: ['common', 'error', 'mustBeAtMost'], options: {replace: {maxValue}}}
    : 'OK'

export const areFundsEnough = (
  funds: BigNumber,
  decimals: number = ETC_CHAIN.decimals,
): ReturnType<typeof isLowerOrEqual> => {
  return isLowerOrEqual(funds.shiftedBy(-decimals), {
    tKey: ['wallet', 'error', 'insufficientFunds'],
  })
}

const messageForHasAtMostDecimalPlaces = (dp: number): Translatable =>
  dp === 0
    ? {tKey: ['common', 'error', 'itMustBeAnInteger']}
    : {tKey: ['common', 'error', 'atMostDecimalPlacesArePermitted'], options: {count: dp}}

export const hasAtMostDecimalPlaces = (dp = ETC_CHAIN.decimals) => (
  b: BigNumber,
): ValidationResult => (b.dp() > dp ? messageForHasAtMostDecimalPlaces(dp) : 'OK')

export function validateAmount(
  v: string,
  validators: Array<(b: BigNumber) => ValidationResult> = [isGreater(), hasAtMostDecimalPlaces()],
): ValidationResult {
  const b = new BigNumber(v)
  return validators.reduce(
    (acc: ValidationResult, cur): ValidationResult => (acc !== 'OK' ? acc : cur(b)),
    'OK',
  )
}

export function validateTxAmount(amount: string, availableAmount: BigNumber): ValidationResult {
  return validateAmount(amount, [
    isGreater(),
    areFundsEnough(availableAmount),
    hasAtMostDecimalPlaces(),
  ])
}

export function validateFee(fee: string): ValidationResult {
  return validateAmount(fee, [isGreaterOrEqual(), hasAtMostDecimalPlaces()])
}

export function bigSum(numbers: BigNumber[]): BigNumber {
  return numbers.reduce((acc, cur) => acc.plus(cur), new BigNumber(0))
}

export function returnDataToHumanReadable(hex: string): string {
  // Converts contract return data to human-readable ASCII
  // Replacement for web3.toAscii
  const toParse = hex.substring(0, 2) === '0x' ? hex.substring(10) : hex.substring(8)
  return _.chunk(toParse, 2)
    .map((chunk) => {
      const code = parseInt(chunk.join(''), 16)
      // Valid chars: from space to tilde
      return code >= 32 && code <= 126 ? String.fromCharCode(code) : ''
    })
    .join('')
    .trim()
}

const ETC_ADDRESS_REGEX = new RegExp('^0x[a-fA-F0-9]{40}$')

export function validateEthAddress(rawInput?: string): ValidationResult {
  if (rawInput == null || rawInput.length === 0)
    return {tKey: ['common', 'error', 'ethAddressMustBeSet']}
  // Note: use isChecksumAddress for checksum check
  if (!ETC_ADDRESS_REGEX.test(rawInput)) return {tKey: ['common', 'error', 'invalidEthAddress']}
  return 'OK'
}

const MAX_KEY_VALUE = new BigNumber(
  '0xfffffffffffffffffffffffffffffffebaaedce6af48a03bbfd25e8cd0364141',
)

export function validateEthPrivateKey(privateKey?: string): ValidationResult {
  if (privateKey == null || privateKey.length === 0) {
    return {tKey: ['common', 'error', 'ethPrivateKeyMustBeSet']}
  }
  try {
    const k = new BigNumber(privateKey)
    if (!k.isFinite() || k.isZero() || k.isGreaterThan(MAX_KEY_VALUE)) {
      return {tKey: ['common', 'error', 'invalidEthPrivateKey']}
    }
  } catch (e) {
    return {tKey: ['common', 'error', 'invalidEthPrivateKey']}
  }
  return 'OK'
}

type AntValidator = {
  validator: (rule: Rule, value: StoreValue) => Promise<void>
}

export function toAntValidator(
  t: TFunctionRenderer,
  validate: (value?: string) => ValidationResult,
): AntValidator {
  return {
    validator: (_rule, value) => {
      const validationResult = validate(value)
      return validationResult === 'OK'
        ? Promise.resolve()
        : Promise.reject(t(validationResult.tKey, validationResult.options))
    },
  }
}

export function translateValidationResult(t: TFunctionRenderer, vr: ValidationResult): string {
  return vr === 'OK' ? '' : t(vr.tKey, vr.options)
}

export const createTxAmountValidator = (
  t: TFunctionRenderer,
  availableAmount: BigNumber,
): AntValidator =>
  toAntValidator(
    t,
    (amount?: string): ValidationResult => validateTxAmount(amount || '', availableAmount),
  )

export const validateAddress = (value?: string): ValidationResult => {
  if (!value) {
    return {tKey: ['wallet', 'error', 'addressMustBeSet']}
  }

  return isAddress(value)
    ? 'OK'
    : {
        tKey: ['wallet', 'error', 'invalidAddress'],
      }
}

/**
 * Return true if Option<T> contains value of type T
 * e.g.
 * ```
 * optionHasValue(some(1), 1) === true
 * optionHasValue(some(2), 1) === false
 * optionHasValue(none, 1) === false
 * ```
 */
export const optionHasValue = <T>(option: Option<T>, value: T): boolean =>
  elem(fromEquals(_.isEqual))(value, option)

/**
 * Used to handle keyboard events similarly to onClick for interactive non-button elements
 */
const onKeyDownEnter = (callback: () => void) => (event: React.KeyboardEvent) => {
  if (event.key === 'Enter') callback()
}

// extend if necessary
type Role = 'button' | 'link' | 'switch'
interface AriaProps {
  onClick(event: React.MouseEvent<HTMLElement, MouseEvent>): void
  onKeyDown(event: React.KeyboardEvent): void
  role: Role
  tabIndex: number
}

/**
 * Allows keyboard interaction (tabbing, enter->onClick) for the element
 * e.g. `<div {...fillActionHandlers(() => doSomething())}>Open</div>`
 *
 * @param onClick onClick (on Enter) handler
 * @param role https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Roles
 */
export const fillActionHandlers = (
  onClick: (event?: React.MouseEvent<HTMLElement, MouseEvent>) => void,
  role: Role = 'button',
): AriaProps => ({
  onClick,
  onKeyDown: onKeyDownEnter(onClick),
  role,
  tabIndex: 0,
})

export const utf8Length = (str: string): number => new Blob([str]).size

export const validateUtf8Length = (lengthInBytes: number) => (value?: string): ValidationResult =>
  value != null && utf8Length(value) > lengthInBytes
    ? {tKey: ['wallet', 'error', 'textIsLimitedToBytes'], options: {count: lengthInBytes}}
    : 'OK'
