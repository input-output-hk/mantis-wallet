import React, {useState} from 'react'
import _ from 'lodash/fp'
import SVG from 'react-inlinesvg'
import classnames from 'classnames'
import {ThemeState} from '../theme-state'
import {RouterState} from '../router-state'
import {MENU, MenuId, MenuItem} from '../routes-config'
import {LUNA_VERSION} from '../shared/version'
import {loadLunaStatus, loadConfig, loadLunaManagedConfig} from '../config/renderer'
import {useInterval} from '../common/hook-utils'
import {WalletState, canRemoveWallet, SynchronizationStatus} from '../common/wallet-state'
import {Link} from '../common/Link'
import {StatusModal} from '../common/StatusModal'
import {ProofOfBurnState} from '../pob/pob-state'
import {GlacierState} from '../glacier-drop/glacier-state'
import {LogOutModal} from '../wallets/modals/LogOutModal'
import {LINKS} from '../external-link-config'
import lightLogo from '../assets/light/logo.png'
import darkLogo from '../assets/dark/logo.png'
import './Sidebar.scss'

const DEV_MODE = true // FIXME: [PM-1966] add config option to enable "hack mode"
// const DEV_MODE = !process.env.NODE_ENV || process.env.NODE_ENV === 'development'

const UpdatingStatusModal = ({
  syncStatus,
  onCancel,
}: {
  syncStatus?: SynchronizationStatus
  onCancel: () => void
}): JSX.Element => {
  const [lunaStatus, setLunaStatus] = useState(loadLunaStatus)

  useInterval(() => setLunaStatus(_.clone(loadLunaStatus())), 2000)

  return (
    <StatusModal
      status={lunaStatus}
      config={loadConfig()}
      managedConfig={loadLunaManagedConfig()}
      syncStatus={syncStatus}
      onCancel={onCancel}
      visible
    />
  )
}

export const Sidebar = (): JSX.Element => {
  const themeState = ThemeState.useContainer()
  const logo = themeState.theme === 'dark' ? darkLogo : lightLogo

  const walletState = WalletState.useContainer()
  const routerState = RouterState.useContainer()
  const pobState = ProofOfBurnState.useContainer()
  const glacierState = GlacierState.useContainer()

  const [showLogOutModal, setShowLogOutModal] = useState(false)
  const [showStatusModal, setShowStatusModal] = useState(false)

  const logOut =
    canRemoveWallet(walletState) && !routerState.isLocked ? (
      <span className="footer-link" onClick={() => setShowLogOutModal(true)}>
        Log Out
      </span>
    ) : (
      <span className={classnames('footer-link', 'disabled')}>Log Out</span>
    )

  const handleMenuClick = (menuId: MenuId): void => routerState.navigate(MENU[menuId].route)

  return (
    <div className="Sidebar">
      {DEV_MODE && (
        <div className="ApiTestToggle" onClick={() => routerState.navigate('API_TEST')}></div>
      )}
      <div className="logo">
        <img src={logo} alt="logo" />
      </div>
      <div>
        <h1 className="title">Luna</h1>
      </div>
      <div>
        <nav>
          <ul className={classnames('navigation', {locked: routerState.isLocked})}>
            {Object.entries(MENU).map(([menuId, menuItem]: [string, MenuItem]) => {
              const isActive = routerState.currentRoute.menu === menuId
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
      <div className="footer">
        <div>
          <Link href={LINKS.support} className="footer-link">
            Support
          </Link>{' '}
          |{' '}
          <Link href={LINKS.feedback} className="footer-link">
            Feedback
          </Link>
        </div>
        <div>
          <span className="footer-link" onClick={() => setShowStatusModal(true)}>
            Status
          </span>{' '}
          | {logOut}
        </div>
        <div className="version">{LUNA_VERSION}</div>
      </div>
      {canRemoveWallet(walletState) && !routerState.isLocked && (
        <LogOutModal
          visible={showLogOutModal}
          onLogOut={async (passphrase: string): Promise<void> => {
            const removed = await walletState.remove({passphrase})
            if (!removed) {
              throw new Error('Log out was not successful.')
            }
            pobState.reset()
            glacierState.removeClaims()
            setShowLogOutModal(false)
          }}
          onCancel={() => setShowLogOutModal(false)}
        />
      )}
      {showStatusModal && (
        <UpdatingStatusModal
          syncStatus={walletState.walletStatus === 'LOADED' ? walletState.syncStatus : undefined}
          onCancel={() => setShowStatusModal(false)}
        />
      )}
    </div>
  )
}
