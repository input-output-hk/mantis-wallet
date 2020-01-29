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
