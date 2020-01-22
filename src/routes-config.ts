import {Unimplemented} from './common/Unimplemented'
import {WalletSetup} from './wallets/WalletSetup'
import {ApiTest} from './components/ApiTest'
import {Wallets} from './wallets/Wallets'
import {WalletUnlock} from './wallets/WalletUnlock'

interface Routes {
  [key: string]: Route
}

interface Route {
  title: string
  path: string
  icon: string
  component: (props: object) => JSX.Element
  hidden?: boolean
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
    component: Wallets,
  },
  WALLET_SETUP: {
    title: 'Wallet Setup',
    path: '/wallets/setup',
    icon: 'menu-wallets.svg',
    component: WalletSetup,
    hidden: true,
  },
  WALLET_UNLOCK: {
    title: 'Unlock Wallet',
    path: '/wallets/unlock',
    icon: 'menu-wallets.svg',
    component: WalletUnlock,
    hidden: true,
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
    component: Unimplemented,
  },
  SETTINGS: {
    title: 'Settings',
    path: '/settings',
    icon: 'menu-settings.svg',
    component: ApiTest,
  },
}
