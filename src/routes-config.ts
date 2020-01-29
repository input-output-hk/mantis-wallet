import {Unimplemented} from './common/Unimplemented'
import {WalletSetup} from './wallets/WalletSetup'
import {ApiTest} from './components/ApiTest'
import {Wallets} from './wallets/Wallets'
import {WalletUnlock} from './wallets/WalletUnlock'
import menuPortfolioIcon from './assets/icons/menu-portfolio.svg'
import menuPobIcon from './assets/icons/menu-pob.svg'
import menuWalletsIcon from './assets/icons/menu-wallets.svg'
import menuGlacierIcon from './assets/icons/menu-glacier.svg'
import menuSettingsIcon from './assets/icons/menu-settings.svg'

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
    icon: menuPortfolioIcon,
    component: Unimplemented,
  },
  WALLETS: {
    title: 'Wallets',
    path: '/wallets',
    icon: menuWalletsIcon,
    component: Wallets,
  },
  WALLET_SETUP: {
    title: 'Wallet Setup',
    path: '/wallets/setup',
    icon: menuWalletsIcon,
    component: WalletSetup,
    hidden: true,
  },
  WALLET_UNLOCK: {
    title: 'Unlock Wallet',
    path: '/wallets/unlock',
    icon: menuWalletsIcon,
    component: WalletUnlock,
    hidden: true,
  },
  PROOF_OF_BURN: {
    title: 'Proof of Burn',
    path: '/proof-of-burn',
    icon: menuPobIcon,
    component: Unimplemented,
  },
  GLACIER_DROP: {
    title: 'Glacier Drop',
    path: '/glacier-drop',
    icon: menuGlacierIcon,
    component: Unimplemented,
  },
  SETTINGS: {
    title: 'Settings',
    path: '/settings',
    icon: menuSettingsIcon,
    component: ApiTest,
  },
}
