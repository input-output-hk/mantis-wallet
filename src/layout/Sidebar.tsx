import React, {useState} from 'react'
import SVG from 'react-inlinesvg'
import classnames from 'classnames'
import {ThemeState} from '../theme-state'
import {RouterState} from '../router-state'
import {MENU, MenuId, MenuItem} from '../routes-config'
import {WalletState, canRemoveWallet} from '../common/wallet-state'
import {LogOutModal} from '../wallets/modals/LogOutModal'
import lightLogo from '../assets/light/logo.png'
import darkLogo from '../assets/dark/logo.png'
import './Sidebar.scss'

export const Sidebar = (): JSX.Element => {
  const themeState = ThemeState.useContainer()
  const logo = themeState.theme === 'dark' ? darkLogo : lightLogo

  const walletState = WalletState.useContainer()
  const routerState = RouterState.useContainer()

  const [showLogOutModal, setShowLogOutModal] = useState(false)

  const logOut = canRemoveWallet(walletState) ? (
    <span className="link" onClick={() => setShowLogOutModal(true)}>
      Log Out
    </span>
  ) : (
    <span className={classnames('link', 'disabled')}>Log Out</span>
  )

  const handleMenuClick = (menuId: MenuId): void => routerState.navigate(MENU[menuId].route)

  return (
    <div className="Sidebar">
      <div className="logo">
        <img src={logo} alt="logo" />
      </div>
      <div>
        <h1 className="title">Luna</h1>
      </div>
      <div>
        <nav>
          <ul className="navigation">
            {Object.entries(MENU).map(([menuId, menuItem]: [string, MenuItem]) => {
              const isActive = routerState.currentRoute.menu == menuId
              const classes = classnames('link', {active: isActive})
              return (
                <li key={menuId}>
                  <div className={classes} onClick={() => handleMenuClick(menuId as MenuId)}>
                    <span className="prefix">&nbsp;</span>
                    <span className="icon">
                      &nbsp;
                      <SVG className="svg" src={menuItem.icon} />
                    </span>
                    <span className="link-title">{menuItem.title}</span>
                  </div>
                </li>
              )
            })}
          </ul>
        </nav>
      </div>
      <div className="footer">Support | {logOut}</div>
      {canRemoveWallet(walletState) && (
        <LogOutModal
          visible={showLogOutModal}
          onLogOut={async (passphrase: string): Promise<boolean> => {
            const removed = await walletState.remove({passphrase})
            if (removed) setShowLogOutModal(false)
            return removed
          }}
          onCancel={() => setShowLogOutModal(false)}
        />
      )}
    </div>
  )
}
