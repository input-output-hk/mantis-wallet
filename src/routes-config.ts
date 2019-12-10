import Unimplemented from './components/Unimplemented'

interface Routes {
  [key: string]: Route
}

interface Route {
  title: string
  path: string
  component: (props: object) => JSX.Element
}

export const ROUTES: Routes = {
  PORTFOLIO: {
    title: 'Portfolio',
    path: '/portfolio',
    component: Unimplemented,
  },
  WALLETS: {
    title: 'Wallets',
    path: '/wallets',
    component: Unimplemented,
  },
  PROOF_OF_BURN: {
    title: 'Proof of Burn',
    path: '/proof-of-burn',
    component: Unimplemented,
  },
  GLACIER_DROP: {
    title: 'Galcier Drop',
    path: '/glacier-drop',
    component: Unimplemented,
  },
  SETTINGS: {
    title: 'Settings',
    path: '/settings',
    component: Unimplemented,
  },
}
