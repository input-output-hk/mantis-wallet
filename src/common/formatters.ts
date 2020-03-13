import BigNumber from 'bignumber.js'
import {bigToNumber, hasMaxDecimalPlaces} from './util'

const LOCALE = 'en-US'

const dateTimeFormatSettings = {
  year: 'numeric',
  month: 'numeric',
  day: 'numeric',
  hour: 'numeric',
  minute: 'numeric',
  second: 'numeric',
}

type FORMAT_AMOUNT_MODE = 'relaxed' | 'strict'

export const formatAmount = (
  n: BigNumber,
  decimalPlaces?: number,
  mode: FORMAT_AMOUNT_MODE = 'strict',
): string => {
  switch (mode) {
    case 'strict':
      return n.toFormat(decimalPlaces)
    case 'relaxed':
      return decimalPlaces && hasMaxDecimalPlaces(n, decimalPlaces)
        ? n.toFormat(decimalPlaces)
        : n.toFormat()
  }
}

export const formatPercentage = (ratio: number | BigNumber): string => {
  // eslint-disable-next-line
  if (BigNumber.isBigNumber(ratio)) ratio = bigToNumber(ratio)

  if (Number.isNaN(ratio)) {
    return '0'
  } else {
    return new Intl.NumberFormat(LOCALE).format(Math.round(ratio * 10000) / 100)
  }
}

export const formatDate = (d: Date): string =>
  new Intl.DateTimeFormat(LOCALE, dateTimeFormatSettings).format(d)

export const abbreviateAmount = (amount: BigNumber): {relaxed: string; strict: string} => {
  const log10 = amount.isZero() ? 0 : Math.log10(bigToNumber(amount)) | 0

  const decimalPlaces = Math.max(6 - log10, 2)

  return {
    strict: formatAmount(amount, decimalPlaces, 'strict'),
    relaxed: formatAmount(amount, decimalPlaces, 'relaxed'),
  }
}
