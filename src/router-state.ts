import {useState} from 'react'
import {createContainer} from 'unstated-next'
import {ROUTES, MENU, RouteId, Route, MenuItem} from './routes-config'
import {rendererLog} from './common/logger'

interface RouterState {
  currentRouteId: RouteId
  currentRoute: Route
  currentMenu: MenuItem
  isLocked: boolean
  navigate: (routeId: RouteId) => void
  setLocked: (isLocked: boolean) => void
}

interface InitialState {
  routeId: RouteId
  isLocked: boolean
}

function useRouterState(
  initialState: InitialState = {routeId: 'TXNS', isLocked: false},
): RouterState {
  const [currentRouteId, setCurrentRouteId] = useState<RouteId>(initialState.routeId)
  const [isLocked, setLocked] = useState<boolean>(initialState.isLocked)

  const currentRoute = ROUTES[currentRouteId]
  const currentMenu = MENU[currentRoute.menu]

  const navigate = (routeId: RouteId): void => {
    if (isLocked) {
      return rendererLog.debug(`Attempted navigation to ${routeId} while navigation is locked`)
    }
    if (routeId === currentRouteId) {
      return rendererLog.debug(`Attempted double navigation to ${routeId}`)
    }
    rendererLog.debug(`Navigation to ${routeId}`)
    setCurrentRouteId(routeId)
  }

  return {
    currentRouteId,
    currentRoute,
    currentMenu,
    isLocked,
    navigate,
    setLocked,
  }
}

export const RouterState = createContainer(useRouterState)
