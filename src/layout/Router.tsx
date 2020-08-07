import React, {useEffect, useRef} from 'react'
import {RouterState} from '../router-state'
import {RouteId} from '../routes-config'
import './Router.scss'

export const Router = (): JSX.Element => {
  const {
    currentRoute: {component: Component},
  } = RouterState.useContainer()
  const mainRef = useRef<HTMLElement>(null)

  useEffect(() => {
    mainRef.current?.scroll({top: 0})
  }, [Component])

  return (
    <main id="main" className="Router" ref={mainRef}>
      <Component />
    </main>
  )
}

interface NavigateProps {
  to: RouteId
}

export const Navigate = ({to}: NavigateProps): JSX.Element => {
  const routerState = RouterState.useContainer()

  useEffect(() => {
    routerState.navigate(to)
  }, [])

  return <></>
}
