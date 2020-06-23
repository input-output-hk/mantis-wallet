import React, {useState} from 'react'
import _ from 'lodash/fp'
import SVG from 'react-inlinesvg'
import classnames from 'classnames'
import {SettingsState} from '../settings-state'
import {RouterState} from '../router-state'
import {MENU, MenuId, MenuItem} from '../routes-config'
import {loadLunaStatus, loadConfig, loadLunaManagedConfig} from '../config/renderer'
import {useInterval} from '../common/hook-utils'
import {WalletState, canRemoveWallet, SynchronizationStatus} from '../common/wallet-state'
import {Link} from '../common/Link'
import {StatusModal} from '../common/StatusModal'
import {ProofOfBurnState} from '../pob/pob-state'
import {GlacierState} from '../glacier-drop/glacier-state'
import {LogOutModal} from '../wallets/modals/LogOutModal'
import {LINKS} from '../external-link-config'
import {BackendState} from '../common/backend-state'
import {isTestnet, TESTNET_EDITION} from '../shared/version'
import lightLogo from '../assets/light/logo.png'
import darkLogo from '../assets/dark/logo.png'
import './Sidebar.scss'

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

interface SidebarProps {
  version: string
}

export const Sidebar = ({version}: SidebarProps): JSX.Element => {
  const {theme} = SettingsState.useContainer()
  const logo = theme === 'dark' ? darkLogo : lightLogo

  const walletState = WalletState.useContainer()
  const routerState = RouterState.useContainer()
  const pobState = ProofOfBurnState.useContainer()
  const glacierState = GlacierState.useContainer()
  const {networkTag} = BackendState.useContainer()

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
      {isTestnet(networkTag) && (
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
          <Link href={LINKS.support} popoverPlacement="right" className="footer-link support">
            Support
          </Link>
          <Link href={LINKS.feedback} popoverPlacement="right" className="footer-link feedback">
            Feedback
          </Link>
        </div>
        <div>
          <span onClick={() => setShowStatusModal(true)} className="footer-link status">
            Status
          </span>
          {logOut}
        </div>
        <div className="version">
          {version}
          {isTestnet(networkTag) && <span className="edition"> — {TESTNET_EDITION}</span>}
        </div>
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
