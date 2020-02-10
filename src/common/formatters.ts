const dateTimeFormatSettings = {
  year: 'numeric',
  month: 'numeric',
  day: 'numeric',
  hour: 'numeric',
  minute: 'numeric',
  second: 'numeric',
}

export const formatAmount = (n: number): string => new Intl.NumberFormat('en-US').format(n)

export const formatPercentage = (ratio: number): string =>
  formatAmount(Math.round(ratio * 10000) / 100)

export const formatDate = (d: Date): string =>
  new Intl.DateTimeFormat('en-US', dateTimeFormatSettings).format(d)

const SI_SYMBOL = ['', 'k', 'M', 'G', 'T', 'P', 'E', 'Z', 'Y', '?', '??', '???']

export const abbreviateNumber = (number: number): string => {
  // determine SI symbol
  const tier = (Math.log10(number) / 3) | 0

  // below M: we don't abbreviate
  if (tier < 2) return number.toString()

  // get suffix and determine scale
  const suffix = SI_SYMBOL[tier]
  const scale = Math.pow(10, tier * 3)

  // scale the number
  const scaled = number / scale

  // format number and add suffix
  return formatAmount(scaled) + suffix
}
