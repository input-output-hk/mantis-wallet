import React, {useEffect} from 'react'
import {RouterState} from '../router-state'
import {RouteId} from '../routes-config'
import './Router.scss'

export const Router = (): JSX.Element => {
  const {
    currentRoute: {component: Component},
  } = RouterState.useContainer()

  return (
    <main className="Router">
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
