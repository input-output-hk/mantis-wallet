import {Unimplemented} from './common/Unimplemented'
import {WalletSetup} from './wallets/WalletSetup'
import {ApiTest} from './ApiTest'
import {Wallets} from './wallets/Wallets'
import {WalletUnlock} from './wallets/WalletUnlock'
import {BurnCentre} from './pob/BurnCentre'
import {BurnCoins} from './pob/BurnCoins'
import {GlacierDropOverview} from './glacier-drop/GlacierDropOverview'
import menuPortfolioIcon from './assets/icons/menu-portfolio.svg'
import menuWalletsIcon from './assets/icons/menu-wallets.svg'
import menuPobIcon from './assets/icons/menu-pob.svg'
import menuGlacierIcon from './assets/icons/menu-glacier.svg'
import menuSettingsIcon from './assets/icons/menu-settings.svg'

// Menu

export type MenuId = 'PORTFOLIO' | 'WALLETS' | 'PROOF_OF_BURN' | 'GLACIER_DROP' | 'SETTINGS'

export interface MenuItem {
  title: string
  route: RouteId
  icon: string
}

export type Menu = {
  [key in MenuId]: MenuItem
}

export const MENU: Menu = {
  PORTFOLIO: {
    title: 'Portfolio',
    route: 'PORTFOLIO',
    icon: menuPortfolioIcon,
  },
  WALLETS: {
    title: 'Wallets',
    route: 'WALLETS',
    icon: menuWalletsIcon,
  },
  PROOF_OF_BURN: {
    title: 'Proof of Burn',
    route: 'BURN_CENTRE',
    icon: menuPobIcon,
  },
  GLACIER_DROP: {
    title: 'Glacier Drop',
    route: 'GLACIER_DROP',
    icon: menuGlacierIcon,
  },
  SETTINGS: {
    title: 'Settings',
    route: 'SETTINGS',
    icon: menuSettingsIcon,
  },
}

// Routes

export type RouteId =
  | 'PORTFOLIO'
  | 'WALLETS'
  | 'WALLET_SETUP'
  | 'WALLET_UNLOCK'
  | 'BURN_CENTRE'
  | 'BURN_COINS'
  | 'GLACIER_DROP'
  | 'SETTINGS'

export interface Route {
  component: React.ComponentType
  menu: MenuId
}

export type Routes = {
  [key in RouteId]: Route
}

export const ROUTES: Routes = {
  PORTFOLIO: {
    component: Unimplemented,
    menu: 'PORTFOLIO',
  },
  WALLETS: {
    component: Wallets,
    menu: 'WALLETS',
  },
  WALLET_SETUP: {
    component: WalletSetup,
    menu: 'WALLETS',
  },
  WALLET_UNLOCK: {
    component: WalletUnlock,
    menu: 'WALLETS',
  },
  BURN_CENTRE: {
    component: BurnCentre,
    menu: 'PROOF_OF_BURN',
  },
  BURN_COINS: {
    component: BurnCoins,
    menu: 'PROOF_OF_BURN',
  },
  GLACIER_DROP: {
    component: GlacierDropOverview,
    menu: 'GLACIER_DROP',
  },
  SETTINGS: {
    component: ApiTest,
    menu: 'SETTINGS',
  },
}
