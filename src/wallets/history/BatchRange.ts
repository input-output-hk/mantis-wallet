import _ from 'lodash/fp'

export interface BatchRange {
  min: number
  max: number
}

const negativeToZero = (nr: number): number => (Number.isInteger(nr) && nr >= 0 ? nr : 0)

export const BatchRange = {
  ofSize: (min: number, size: number): BatchRange => ({
    min: negativeToZero(min),
    max: min + size - 1,
  }),
  ofSizeFromMax: (max: number, size: number): BatchRange => ({
    min: negativeToZero(max - size + 1),
    max,
  }),
  lower: (a: BatchRange, b: BatchRange): BatchRange => (a.min <= b.min ? a : b),
  isEqual: (a: BatchRange, b: BatchRange): boolean => _.isEqual(a, b),
  contains: (nr: number, range: BatchRange): boolean => range.min <= nr && nr <= range.max,
  follows: (nr: number, range: BatchRange): boolean => nr + 1 == range.min,
}
