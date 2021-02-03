import React, {useEffect, useRef, Suspense} from 'react'
import ErrorBoundary from 'antd/lib/alert/ErrorBoundary'
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
      <ErrorBoundary>
        <Suspense fallback={<div />}>
          <Component />
        </Suspense>
      </ErrorBoundary>
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
