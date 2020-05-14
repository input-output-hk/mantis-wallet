import {pipe as rxPipe} from 'rxjs'
import {Option} from 'fp-ts/lib/Option'
import {pipe} from 'fp-ts/lib/pipeable'
import {option} from 'fp-ts'

/**
 * Run a callback and return input. This function is really helpful for:
 *   - adding some logging to chain of functions
 *   - adding some side-effects in the middle of (otherwise pure) pipeline (e.g. some kind of progress notifications)
 *
 * Due to these it should rather be avoided in pure, synchronous code, but is really helpful in some cases
 * @param cb Side-effect to perform with input value
 */
export const tap = <A>(cb: (a: A) => void) => (input: A): A => {
  cb(input)
  return input
}

/**
 * A `tap`, which is optimized for usage in `.then` chains on Promises
 * @param cb Side-effect to perform with value in promise
 */
export const flatTap = <A>(cb: (a: A) => Promise<void>) => (input: A): Promise<A> =>
  cb(input).then(() => input)

/**
 * Curried property getter. It's almost the same as `_.get`, but this has much better type inference
 * @param key Key of object to get
 */
export const prop = <Obj, Key extends keyof Obj>(key: Key) => (obj: Obj): Obj[Key] => obj[key]

type MapProp<Obj, Key extends keyof Obj, NewVal> = {
  [K in keyof Obj]: K extends Key ? NewVal : Obj[K]
}
/**
 * Updates property using specified callback
 */
export const mapProp = <Obj, Key extends keyof Obj, V>(key: Key, cb: (val: Obj[Key]) => V) => (
  obj: Obj,
): MapProp<Obj, Key, V> => ({...obj, [key]: cb(obj[key])} as MapProp<Obj, Key, V>)

/**
 * An alternative for fp-ts pipe, which accepts element after pipeline is built.
 * Example:
 * ```
 * const split = str => str.split(",")
 * const wrap = items => items.map(str => `"${str}"`)
 * const join = items => items.join(", ")
 *
 * itemsStr => pipe(itemsStr, split, wrap, join) <-> through(split, wrap, join)
 * ```
 */
export const through = rxPipe

/**
 * Zips 2 options together
 */
export const optionZip = <A, B>(maybeA: Option<A>, maybeB: Option<B>): Option<[A, B]> =>
  pipe(
    maybeA,
    option.chain((a) =>
      pipe(
        maybeB,
        option.map((b) => [a, b]),
      ),
    ),
  )

/**
 * A promise which waits for the given miliseconds
 */
export const wait = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms))
