import {WalletSetup} from './wallets/WalletSetup'
import {ApiTest} from './ApiTest'
import {Wallets} from './wallets/Wallets'
import {WalletUnlock} from './wallets/WalletUnlock'
import {BurnCentre} from './pob/BurnCentre'
import {BurnCoins} from './pob/BurnCoins'
import {Settings} from './Settings'
import {Tokens} from './tokens/Tokens'
import {TKeyRenderer} from './common/i18n'
// Assets
import menuWalletsIcon from './assets/icons/menu-wallets.svg'
import menuPobIcon from './assets/icons/menu-pob.svg'
import menuSettingsIcon from './assets/icons/menu-settings.svg'
import menuTokensIcon from './assets/icons/menu-tokens.svg'

// Menu

export type MenuId = 'WALLETS' | 'PROOF_OF_BURN' | 'SETTINGS' | 'TOKENS'

export interface MenuItem {
  title: TKeyRenderer
  route: RouteId
  icon: string
}

export type Menu = {
  [key in MenuId]: MenuItem
}

export const MENU: Menu = {
  WALLETS: {
    title: ['title', 'wallets'],
    route: 'WALLETS',
    icon: menuWalletsIcon,
  },
  PROOF_OF_BURN: {
    title: ['title', 'proofOfBurn'],
    route: 'BURN_CENTRE',
    icon: menuPobIcon,
  },
  TOKENS: {
    title: ['title', 'tokens'],
    route: 'TOKENS',
    icon: menuTokensIcon,
  },
  SETTINGS: {
    title: ['title', 'settings'],
    route: 'SETTINGS',
    icon: menuSettingsIcon,
  },
}

// Routes

export type RouteId =
  | 'WALLETS'
  | 'WALLET_SETUP'
  | 'WALLET_UNLOCK'
  | 'BURN_CENTRE'
  | 'BURN_COINS'
  | 'SETTINGS'
  | 'API_TEST'
  | 'TOKENS'

export interface Route {
  component: React.ComponentType
  menu: MenuId
}

export type Routes = {
  [key in RouteId]: Route
}

export const ROUTES: Routes = {
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
  SETTINGS: {
    component: Settings,
    menu: 'SETTINGS',
  },
  API_TEST: {
    component: ApiTest,
    menu: 'SETTINGS',
  },
  TOKENS: {
    component: Tokens,
    menu: 'TOKENS',
  },
}
