export type Diff<T, U> = T extends U ? never : T //Remove types from T that are assignable to U
export type Filter<T, U> = T extends U ? T : never // Remove types from T that are not assignable to U

// ==== Types for keys of object
// see https://stackoverflow.com/a/58436959
type Cons<H, T> = T extends readonly any[] // eslint-disable-line @typescript-eslint/no-explicit-any
  ? ((h: H, ...t: T) => void) extends (...r: infer R) => void
    ? R
    : never
  : never

type Prev = [
  never,
  0,
  1,
  2,
  3,
  4,
  5,
  6,
  7,
  8,
  9,
  10,
  11,
  12,
  13,
  14,
  15,
  16,
  17,
  18,
  19,
  20,
  ...0[] // eslint-disable-line @typescript-eslint/array-type
]

/**
 * Use Path to type-safe path in an object to its last nodes
 *
 * const obj = {foo: {bar: 'string'}}
 *
 * const pathToBar: Path<typeof obj> = ['foo', 'bar'] // correct
 * const pathToFoo: Path<typeof obj> = ['foo'] // error
 */
export type Path<T, D extends number = 5> = [D] extends [never]
  ? never
  : T extends object
  ? {[K in keyof T]-?: Cons<K, Path<T[K], Prev[D]>>}[keyof T]
  : []
// ==== Types for keys of object
