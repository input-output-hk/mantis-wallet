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

export const formatPercentage = (ratio: number): string => {
  if (Number.isNaN(ratio)) {
    return '0'
  } else {
    return new Intl.NumberFormat(LOCALE).format(Math.round(ratio * 10000) / 100)
  }
}

export const formatDate = (d: Date): string =>
  new Intl.DateTimeFormat(LOCALE, dateTimeFormatSettings).format(d)

const SI_SYMBOL = ['', 'k', 'M', 'G', 'T', 'P', 'E', 'Z', 'Y', '?', '??', '???']
const SI_FRACTION_SYMBOL = ['', 'm', 'μ', 'n', 'p', 'f', 'a', 'z', 'y']

export const abbreviateAmount = (amount: BigNumber, decimalPlaces?: number): string => {
  // determine SI symbol
  const tier = (Math.log10(bigToNumber(amount)) / 3) | 0

  // between 0 and M: we don't abbreviate
  if (tier > 0 && tier < 2) return formatAmount(amount, decimalPlaces)

  // get suffix and determine scale
  const suffix = tier > 0 ? SI_SYMBOL[tier] : SI_FRACTION_SYMBOL[-tier]
  const scale = Math.pow(10, tier * 3)

  // scale the number
  const scaled = amount.div(scale)

  // format number and add suffix
  return `${formatAmount(scaled, decimalPlaces)}${suffix}`
}
