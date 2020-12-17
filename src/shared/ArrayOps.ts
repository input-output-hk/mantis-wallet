import {Ord} from 'fp-ts/lib/Ord'
import {readonlyArray} from 'fp-ts'

export const concat = <T>(a: readonly T[]) => (b: readonly T[]): readonly T[] => a.concat(b)
export const sorted = <T>(ord: Ord<T>) => (arr: readonly T[]): readonly T[] =>
  // This is not a mutating call, since detection of mutating code is quite dumb in fp-plugin
  // this function was created to have this suppressed in single place only
  // eslint-disable-next-line fp/no-mutating-methods
  readonlyArray.sort(ord)(arr)
