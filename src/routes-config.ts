import React from 'react'
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
    component: React.lazy(() =>
      import('./wallets/Wallets').then((module) => ({default: module.Wallets})),
    ),
    menu: 'TXNS',
  },
  WALLET_SETUP: {
    component: React.lazy(() =>
      import('./wallets/WalletSetup').then((module) => ({default: module.WalletSetup})),
    ),
    menu: 'TXNS',
  },
  SETTINGS: {
    component: React.lazy(() =>
      import('./Settings').then((module) => ({default: module.Settings})),
    ),
    menu: 'SETTINGS',
  },
  ADDRESS_BOOK: {
    component: React.lazy(() =>
      import('./address-book/AddressBook').then((module) => ({default: module.AddressBook})),
    ),
    menu: 'ADDRESS_BOOK',
  },
  API_TEST: {
    component: React.lazy(() => import('./ApiTest').then((module) => ({default: module.ApiTest}))),
    menu: 'SETTINGS',
  },
}
