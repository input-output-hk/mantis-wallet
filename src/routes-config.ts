import {WalletSetup} from './wallets/WalletSetup'
import {ApiTest} from './ApiTest'
import {Wallets} from './wallets/Wallets'
import {WalletUnlock} from './wallets/WalletUnlock'
import {Settings} from './Settings'
import {Tokens} from './tokens/Tokens'
import {TKeyRenderer} from './common/i18n'
// Assets
import menuWalletsIcon from './assets/icons/menu-wallets.svg'
import menuSettingsIcon from './assets/icons/menu-settings.svg'
import menuTokensIcon from './assets/icons/menu-tokens.svg'

// Menu

export type MenuId = 'WALLETS' | 'TOKENS' | 'SETTINGS'

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
