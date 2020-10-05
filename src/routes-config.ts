import {WalletSetup} from './wallets/WalletSetup'
import {ApiTest} from './ApiTest'
import {Wallets} from './wallets/Wallets'
import {Settings} from './Settings'
// import {Tokens} from './tokens/Tokens'
import {AddressBook} from './common/AddressBook'
import {TKeyRenderer} from './common/i18n'
// Assets
import menuWalletsIcon from './assets/icons/menu-wallets.svg'
import menuSettingsIcon from './assets/icons/menu-settings.svg'
import menuAddressBookIcon from './assets/icons/menu-address-book.svg'
// import menuTokensIcon from './assets/icons/menu-tokens.svg'

// Menu

export type MenuId = 'WALLETS' | 'SETTINGS' | 'ADDRESS_BOOK' // | 'TOKENS'

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
  // TOKENS: {
  //   title: ['title', 'tokens'],
  //   route: 'TOKENS',
  //   icon: menuTokensIcon,
  // },
  ADDRESS_BOOK: {
    title: ['title', 'addressBook'],
    route: 'ADDRESS_BOOK',
    icon: menuAddressBookIcon,
  },
  SETTINGS: {
    title: ['title', 'settings'],
    route: 'SETTINGS',
    icon: menuSettingsIcon,
  },
}

// Routes

export type RouteId = 'WALLETS' | 'WALLET_SETUP' | 'SETTINGS' | 'API_TEST' | 'ADDRESS_BOOK' // | 'TOKENS'

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
  // TOKENS: {
  //   component: Tokens,
  //   menu: 'TOKENS',
  // },
}
