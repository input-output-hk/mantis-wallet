import BigNumber from 'bignumber.js'
import formatDistance from 'date-fns/formatDistance'
import {enUS} from 'date-fns/locale'
import {format} from 'date-fns'
import {DateFormat, TimeFormat} from '../settings-state'

const LOCALE = 'en-US'
const DATE_FNS_LOCALE = enUS

// TODO: PM-2291
// const dateTimeFormatSettings = {
//   year: 'numeric',
//   month: 'numeric',
//   day: 'numeric',
//   hour: 'numeric',
//   minute: 'numeric',
//   second: 'numeric',
// }

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
      return decimalPlaces && n.dp() < decimalPlaces ? n.toFormat(decimalPlaces) : n.toFormat()
  }
}

export const formatPercentage = (ratio: number | BigNumber): string => {
  // eslint-disable-next-line
  if (BigNumber.isBigNumber(ratio)) ratio = ratio.toNumber()

  if (Number.isNaN(ratio)) {
    return '0'
  } else {
    return new Intl.NumberFormat(LOCALE).format(Math.round(ratio * 10000) / 100)
  }
}

export const abbreviateAmount = (amount: BigNumber): {relaxed: string; strict: string} => {
  const log10 = amount.isZero() ? 0 : Math.log10(amount.toNumber()) | 0

  const decimalPlaces = Math.max(Math.min(6 - log10, amount.dp()), 2)

  return {
    strict: formatAmount(amount, decimalPlaces, 'strict'),
    relaxed: formatAmount(amount, decimalPlaces, 'relaxed'),
  }
}

const TIME_FORMAT_TRANSLATIONS: Record<TimeFormat, string> = {
  '12-hour': 'h:mm a',
  '24-hour': 'H:mm',
}

const translateDateFormat = (dateFormat: DateFormat): string =>
  dateFormat.replace('YYYY', 'yyyy').replace('DD', 'dd')

export const formatDate = (date: Date, dateFormat: DateFormat, timeFormat: TimeFormat): string =>
  format(date, `${translateDateFormat(dateFormat)}, ${TIME_FORMAT_TRANSLATIONS[timeFormat]}`, {
    locale: DATE_FNS_LOCALE,
  })

export const toDurationString = (seconds: number): string =>
  formatDistance(0, seconds * 1000, {includeSeconds: true, locale: DATE_FNS_LOCALE})
