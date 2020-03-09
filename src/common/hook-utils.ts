import {RefObject, useEffect, useRef} from 'react'

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
