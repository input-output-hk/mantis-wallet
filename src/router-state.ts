import {useState} from 'react'
import {createContainer} from 'unstated-next'
import {ROUTES, MENU, RouteId, Route, MenuItem} from './routes-config'

interface RouterState {
  currentRoute: Route
  currentMenu: MenuItem
  navigate: (routeId: RouteId) => void
}

interface InitialState {
  routeId: RouteId
}

function useRouterState(initialState: InitialState = {routeId: 'WALLETS'}): RouterState {
  const [currentRouteId, setCurrentRouteId] = useState<RouteId>(initialState.routeId)

  const currentRoute = ROUTES[currentRouteId]
  const currentMenu = MENU[currentRoute.menu]

  const navigate = (routeId: RouteId): void => {
    if (routeId === currentRouteId) {
      return console.debug(`Attempted double navigation to ${routeId}`)
    }
    console.debug(`Navigation to ${routeId}`)
    setCurrentRouteId(routeId)
  }

  return {
    currentRoute,
    currentMenu,
    navigate,
  }
}

export const RouterState = createContainer(useRouterState)
