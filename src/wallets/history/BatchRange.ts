import _ from 'lodash/fp'

export type BatchRangeType = 'scan' | 'new'
export interface BatchRange {
  min: number
  max: number
  //Type 'scan' is for indexing bast blocks while 'new' is for checking transactions near top independently from scanning
  type: BatchRangeType
}
export const BatchRange = {
  ofSize: (min: number, size: number, type: BatchRangeType): BatchRange => ({
    min,
    max: min + size - 1,
    type,
  }),
  ofSizeFromMax: (max: number, size: number, type: BatchRangeType): BatchRange => ({
    min: max - size + 1,
    max,
    type,
  }),
  lower: (a: BatchRange, b: BatchRange): BatchRange => (a.min <= b.min ? a : b),
  isEqual: (a: BatchRange, b: BatchRange): boolean => _.isEqual(a, b),
  contains: (nr: number, range: BatchRange): boolean => range.min <= nr && nr <= range.max,
  follows: (nr: number, range: BatchRange): boolean => nr + 1 == range.min,
  miniMini: (a: BatchRange, b: BatchRange): BatchRange => ({
    min: Math.min(a.min, b.min),
    max: Math.min(a.max, b.max),
    type: a.type,
  }),
}
