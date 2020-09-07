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
import {SupportModal} from '../common/SupportModal'
import {fillActionHandlers} from '../common/util'
import {RemoveWalletModal} from '../wallets/modals/RemoveWalletModal'
import {LockWalletModal} from '../wallets/modals/LockWalletModal'
import {LINKS} from '../external-link-config'
import {BackendState} from '../common/backend-state'
import {TokensState} from '../tokens/tokens-state'
import {isTestnet} from '../shared/version'
import {Trans} from '../common/Trans'
import {createTErrorRenderer} from '../common/i18n'
import lightLogo from '../assets/light/logo.png'
import darkLogo from '../assets/dark/logo.png'
import './Sidebar.scss'

type ModalId = 'none' | 'LockWallet' | 'RemoveWallet' | 'Support' | 'Status'

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
  const {
    theme,
    translation: {t},
  } = SettingsState.useContainer()
  const logo = theme === 'dark' ? darkLogo : lightLogo

  const walletState = WalletState.useContainer()
  const routerState = RouterState.useContainer()
  const tokensState = TokensState.useContainer()
  const {networkTag} = BackendState.useContainer()

  const [activeModal, setActiveModal] = useState<ModalId>('none')

  const LogOutButton = (): JSX.Element => {
    const classNames = ['footer-link', 'logout']

    if (walletState.walletStatus === 'LOADED' && !routerState.isLocked) {
      return (
        <span
          className={classnames(...classNames)}
          {...fillActionHandlers(() => setActiveModal('LockWallet'), 'link')}
        >
          <Trans k={['wallet', 'button', 'logOutOfWallet']} />
        </span>
      )
    } else {
      return (
        <span className={classnames(...classNames, 'disabled')}>
          <Trans k={['wallet', 'button', 'logOutOfWallet']} />
        </span>
      )
    }
  }

  const handleMenuClick = (menuId: MenuId): void => routerState.navigate(MENU[menuId].route)

  return (
    <header className="Sidebar">
      {isTestnet(networkTag) && (
        /* eslint-disable-next-line jsx-a11y/click-events-have-key-events,jsx-a11y/no-static-element-interactions */
        <div className="ApiTestToggle" onClick={() => routerState.navigate('API_TEST')}></div>
      )}
      <div className="logo">
        <img src={logo} alt="logo" />
      </div>
      <div>
        <h1 className="title">
          <Trans k={['title', 'luna']} />
        </h1>
      </div>
      <div>
        <nav>
          <ul className={classnames('navigation', {locked: routerState.isLocked})}>
            {Object.entries(MENU).map(([menuId, menuItem]: [string, MenuItem]) => {
              const isActive = routerState.currentRoute.menu === menuId
              const classes = classnames('link', {active: isActive})
              return (
                <li key={menuId}>
                  <div
                    className={classes}
                    {...fillActionHandlers(() => handleMenuClick(menuId as MenuId), 'link')}
                  >
                    <span className="prefix">&nbsp;</span>
                    <span className="icon">
                      &nbsp;
                      <SVG
                        className={classnames('svg', menuId.toLowerCase())}
                        src={menuItem.icon}
                      />
                    </span>
                    <span className="link-title">{t(menuItem.title)}</span>
                  </div>
                </li>
              )
            })}
          </ul>
        </nav>
      </div>
      <div className="footer">
        <div className="footer-link-wrapper">
          <span
            className="footer-link support"
            {...fillActionHandlers(() => setActiveModal('Support'), 'link')}
          >
            <Trans k={['common', 'link', 'support']} />
          </span>
          <Link href={LINKS.feedback} popoverPlacement="right" className="footer-link feedback">
            <Trans k={['common', 'link', 'feedback']} />
          </Link>
        </div>
        <div className="footer-link-wrapper">
          <span
            className="footer-link status"
            {...fillActionHandlers(() => setActiveModal('Status'), 'link')}
          >
            <Trans k={['common', 'link', 'status']} />
          </span>
          <LogOutButton />
        </div>
        <div className="version">
          {version}
          {isTestnet(networkTag) && (
            <span className="edition">
              {' '}
              — <Trans k={['title', 'testnetEdition']} />
            </span>
          )}
        </div>
      </div>
      {walletState.walletStatus === 'LOADED' && !routerState.isLocked && (
        <LockWalletModal
          visible={activeModal === 'LockWallet'}
          toRemoveWallet={() => setActiveModal('RemoveWallet')}
          lock={async (passphrase: string): Promise<void> => {
            const isLocked = await walletState.lock({passphrase})
            if (!isLocked) {
              throw createTErrorRenderer(['wallet', 'error', 'couldNotLockWallet'])
            }
            setActiveModal('none')
          }}
          onCancel={() => setActiveModal('none')}
        />
      )}
      {canRemoveWallet(walletState) && !routerState.isLocked && (
        <RemoveWalletModal
          visible={activeModal === 'RemoveWallet'}
          onRemoveWallet={async (passphrase: string): Promise<void> => {
            const removed = await walletState.remove({passphrase})
            if (!removed) {
              throw createTErrorRenderer(['wallet', 'error', 'couldNotRemoveWallet'])
            }
            tokensState.reset()
            setActiveModal('none')
          }}
          onCancel={() => setActiveModal('none')}
        />
      )}
      {activeModal === 'Status' && (
        <UpdatingStatusModal
          syncStatus={walletState.walletStatus === 'LOADED' ? walletState.syncStatus : undefined}
          onCancel={() => setActiveModal('none')}
        />
      )}
      <SupportModal visible={activeModal === 'Support'} onCancel={() => setActiveModal('none')} />
    </header>
  )
}
