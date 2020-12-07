import {WalletSetup} from './wallets/WalletSetup'
import {ApiTest} from './ApiTest'
import {Wallets} from './wallets/Wallets'
import {Settings} from './Settings'
import {AddressBook} from './address-book/AddressBook'
import {TKeyRenderer} from './common/i18n'

// Menu

export type MenuId = 'TXNS' | 'SETTINGS' | 'ADDRESS_BOOK'

export interface MenuItem {
  title: TKeyRenderer // Title of menu item
  route: RouteId // Navigation target for menu item
}

export type Menu = {
  [key in MenuId]: MenuItem
}

export const MENU: Menu = {
  TXNS: {
    title: ['title', 'transactions'],
    route: 'TXNS',
  },
  ADDRESS_BOOK: {
    title: ['title', 'addressBook'],
    route: 'ADDRESS_BOOK',
  },
  SETTINGS: {
    title: ['title', 'settings'],
    route: 'SETTINGS',
  },
}

// Routes

export type RouteId = 'TXNS' | 'WALLET_SETUP' | 'SETTINGS' | 'API_TEST' | 'ADDRESS_BOOK'

export interface Route {
  component: React.ComponentType // Which component should render?
  menu: MenuId // Which menu item should be active for a specific route?
}

export type Routes = {
  [key in RouteId]: Route
}

export const ROUTES: Routes = {
  TXNS: {
    component: Wallets,
    menu: 'TXNS',
  },
  WALLET_SETUP: {
    component: WalletSetup,
    menu: 'TXNS',
  },
  SETTINGS: {
    component: Settings,
    menu: 'SETTINGS',
  },
  ADDRESS_BOOK: {
    component: AddressBook,
    menu: 'ADDRESS_BOOK',
  },
  API_TEST: {
    component: ApiTest,
    menu: 'SETTINGS',
  },
}
