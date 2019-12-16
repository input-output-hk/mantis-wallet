const dateTimeFormatSettings = {
  year: 'numeric',
  month: 'numeric',
  day: 'numeric',
  hour: 'numeric',
  minute: 'numeric',
  second: 'numeric',
}

export const formatAmount = (n: number): string => new Intl.NumberFormat('en-US').format(n)

export const formatDate = (d: Date): string =>
  new Intl.DateTimeFormat('en-US', dateTimeFormatSettings).format(d)
