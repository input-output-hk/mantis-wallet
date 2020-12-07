import {
  RefObject,
  useEffect,
  useRef,
  useState,
  Dispatch,
  SetStateAction,
  DependencyList,
} from 'react'
import {Store} from './store'
import {rendererLog} from './logger'
import {wait} from '../shared/utils'

export const useIsMounted = (): RefObject<boolean> => {
  const isMounted = useRef(false)
  useEffect((): (() => void) => {
    // eslint-disable-next-line
    isMounted.current = true
    return (): void => {
      // eslint-disable-next-line
      isMounted.current = false
    }
  }, [])
  return isMounted
}

type Callback = () => void

export function useInterval(callback: Callback, delay: number): void {
  const savedCallback = useRef<Callback>()
  const isInitialMount = useRef(true)

  // Remember the latest callback
  useEffect(() => {
    // eslint-disable-next-line
    savedCallback.current = callback
  }, [callback])

  // Set up the interval
  useEffect(() => {
    function tick(): void {
      if (savedCallback.current) savedCallback.current()
    }
    if (delay !== null) {
      if (isInitialMount.current) {
        // eslint-disable-next-line
        isInitialMount.current = false
        callback()
      }
      const id = setInterval(tick, delay)
      return (): void => clearInterval(id)
    }
  }, [delay])
}

type AsyncCallback = () => Promise<void>
export function useRecurringTimeout(callback: AsyncCallback, delay: number): void {
  const savedCallback = useRef<AsyncCallback>()
  const canProceed = useRef<boolean>(true)

  // Remember the latest callback
  useEffect(() => {
    // eslint-disable-next-line fp/no-mutation
    savedCallback.current = callback
  }, [callback])

  function tick(): void {
    if (canProceed.current && savedCallback.current) {
      savedCallback
        .current()
        .then(() => wait(delay))
        .then(tick)
    }
  }

  useEffect(() => {
    tick()
    return () => {
      // eslint-disable-next-line fp/no-mutation
      canProceed.current = false
    }
  }, [delay])
}

const SKIP_UPDATE = 'SKIP UPDATE'

export function useAsyncUpdate<T>(
  update: () => Promise<T>,
  dependencies?: DependencyList,
  skipUpdate: () => Promise<void> = () => Promise.resolve(),
): [T | undefined, Error | string | null, boolean] {
  const [value, setValue] = useState<T>()
  const [progress, setProgress] = useState({error: null, isPending: true})

  useEffect(() => {
    // eslint-disable-next-line
    let isSubscribed = true
    skipUpdate()
      .catch(() => Promise.reject(SKIP_UPDATE))
      .then(update)
      .then((res) => {
        if (isSubscribed) {
          setValue(res)
          setProgress({error: null, isPending: false})
        }
      })
      .catch((error) => {
        if (error !== SKIP_UPDATE) {
          rendererLog.error(error)
          if (isSubscribed) {
            setProgress({error, isPending: false})
          }
        }
      })
    return () => {
      // eslint-disable-next-line
      isSubscribed = false
    }
  }, dependencies)

  return [value, progress.error, progress.isPending]
}

/**
 * When using persisted state, you will need a `Store` which takes care of the persistence
 * and has the data you need for your state.
 *
 * The value at path will be used by this hook analogically as it would be used by `React.useState`.
 *
 * @param path can be a single string referencing the first level of the object stored in Store
 *  or an array of two strings referencing a path to the desired value in the object
 */
export function usePersistedState<TObject extends object, K1 extends keyof TObject>(
  store: Store<TObject>,
  path: K1,
): [TObject[K1], Dispatch<SetStateAction<TObject[K1]>>]
export function usePersistedState<
  TObject extends object,
  K1 extends keyof TObject,
  K2 extends keyof TObject[K1]
>(
  store: Store<TObject>,
  path: [K1, K2],
): [TObject[K1][K2], Dispatch<SetStateAction<TObject[K1][K2]>>]
export function usePersistedState<
  TObject extends object,
  K1 extends keyof TObject,
  K2 extends keyof TObject[K1]
>(
  store: Store<TObject>,
  path: [K1, K2],
): [TObject[K1][K2], Dispatch<SetStateAction<TObject[K1][K2]>>] {
  const [value, setValue] = useState(store.get(path))

  useEffect(() => {
    store.set(path, value)
  }, [value])

  return [value, setValue]
}
