import BigNumber from 'bignumber.js'
import formatDistance from 'date-fns/formatDistance'
import {format, Locale} from 'date-fns'
import {DateFormat, TimeFormat} from './store/settings'

type FormatAmountMode = 'relaxed' | 'strict'

export const formatAmount = (
  n: BigNumber,
  decimalPlaces: number,
  mode: FormatAmountMode,
  format: BigNumber.Format,
): string => {
  switch (mode) {
    case 'strict':
      return n.toFormat(decimalPlaces, format)
    case 'relaxed':
      return n.dp() < decimalPlaces ? n.toFormat(decimalPlaces, format) : n.toFormat(format)
  }
}

export const formatPercentage = (
  ratio: number | BigNumber,
  numberFormat: Intl.NumberFormat,
): string => {
  // eslint-disable-next-line
  if (BigNumber.isBigNumber(ratio)) ratio = ratio.toNumber()

  if (Number.isNaN(ratio)) {
    return '0'
  } else {
    return numberFormat.format(Math.round(ratio * 10000) / 100)
  }
}

export const abbreviateAmount = (
  amount: BigNumber,
  format: BigNumber.Format,
): {relaxed: string; strict: string} => {
  const log10 = amount.isZero() ? 0 : Math.log10(amount.abs().toNumber()) | 0

  const decimalPlaces = Math.max(Math.min(6 - log10, amount.dp()), 2)

  return {
    strict: formatAmount(amount, decimalPlaces, 'strict', format),
    relaxed: formatAmount(amount, decimalPlaces, 'relaxed', format),
  }
}

const TIME_FORMAT_TRANSLATIONS: Record<TimeFormat, string> = {
  '12-hour': 'h:mm a',
  '24-hour': 'H:mm',
}

const translateDateFormat = (dateFormat: DateFormat): string =>
  dateFormat.replace('YYYY', 'yyyy').replace('DD', 'dd')

export const formatDate = (
  date: Date,
  dateFormat: DateFormat,
  timeFormat: TimeFormat,
  locale: Locale,
): string =>
  format(date, `${translateDateFormat(dateFormat)}, ${TIME_FORMAT_TRANSLATIONS[timeFormat]}`, {
    locale,
  })

export const toDurationString = (seconds: number, locale: Locale): string =>
  formatDistance(0, seconds * 1000, {includeSeconds: true, locale})
