import {useEffect, useRef} from 'react'

type Callback = () => void

export function useInterval(callback: Callback, delay: number): void {
  const savedCallback = useRef<Callback>()

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
      const id = setInterval(tick, delay)
      return (): void => clearInterval(id)
    }
  }, [delay])
}
