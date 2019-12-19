import {Unimplemented} from './components/Unimplemented'
import {WalletSetup} from './wallets/WalletSetup'
import {ApiTest} from './components/ApiTest'

interface Routes {
  [key: string]: Route
}

interface Route {
  title: string
  path: string
  icon: string
  component: (props: object) => JSX.Element
}

export const ROUTES: Routes = {
  PORTFOLIO: {
    title: 'Portfolio',
    path: '/portfolio',
    icon: 'menu-portfolio.svg',
    component: Unimplemented,
  },
  WALLETS: {
    title: 'Wallets',
    path: '/wallets',
    icon: 'menu-wallets.svg',
    component: WalletSetup,
  },
  PROOF_OF_BURN: {
    title: 'Proof of Burn',
    path: '/proof-of-burn',
    icon: 'menu-pob.svg',
    component: Unimplemented,
  },
  GLACIER_DROP: {
    title: 'Glacier Drop',
    path: '/glacier-drop',
    icon: 'menu-glacier.svg',
    component: ApiTest,
  },
  SETTINGS: {
    title: 'Settings',
    path: '/settings',
    icon: 'menu-settings.svg',
    component: Unimplemented,
  },
}
