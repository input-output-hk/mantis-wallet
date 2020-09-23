import {pipe as rxPipe} from 'rxjs'
import {Option} from 'fp-ts/lib/Option'
import {pipe} from 'fp-ts/lib/pipeable'
import {option} from 'fp-ts'
import _ from 'lodash/fp'
import log from 'electron-log'

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

/**
 * Retry until condition is met
 */
export const waitUntil = async (conditionFn: () => Promise<boolean>, ms = 100): Promise<void> => {
  const condition = await conditionFn()
  if (!condition) {
    await wait(ms)
    await waitUntil(conditionFn, ms)
  }
}

/**
 * Create logger
 */
/* eslint-disable fp/no-mutation */
export const createLogger = (
  logId: string,
  resolvePath: log.FileTransport['resolvePath'],
): ReturnType<typeof log.create> => {
  const logger = log.create(logId)

  logger.transports.file.resolvePath = resolvePath
  logger.transports.file.level = 'info'
  logger.transports.file.depth = 10
  logger.transports.file.format = (message) => {
    return JSON.stringify({
      time: message.date.getTime(),
      level: message.level,
      data: message.data.map((v) =>
        _.isError(v)
          ? {
              name: v.name,
              message: v.message,
              stack: v.stack,
            }
          : v,
      ),
    })
  }

  return logger
}
/* eslint-enable fp/no-mutation  */
