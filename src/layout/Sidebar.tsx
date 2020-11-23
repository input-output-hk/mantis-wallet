import React, {useState} from 'react'
import SVG from 'react-inlinesvg'
import classnames from 'classnames'
import {EDITION} from '../shared/version'
import {SettingsState} from '../settings-state'
import {RouterState} from '../router-state'
import {MENU, MenuId, MenuItem} from '../routes-config'
import {loadMantisWalletStatus, loadConfig} from '../config/renderer'
import {useInterval} from '../common/hook-utils'
import {WalletState, canRemoveWallet, SynchronizationStatus} from '../common/wallet-state'
import {Link} from '../common/Link'
import {StatusModal} from '../common/StatusModal'
import {SupportModal} from '../common/SupportModal'
import {fillActionHandlers} from '../common/util'
import {RemoveWalletModal} from '../wallets/modals/RemoveWalletModal'
import {LINKS} from '../external-link-config'
import {BackendState} from '../common/backend-state'
import {TokensState} from '../tokens/tokens-state'
import {Trans} from '../common/Trans'
import {createTErrorRenderer} from '../common/i18n'
import logo from '../assets/logo.svg'
import wordmark from '../assets/wordmark.svg'
import './Sidebar.scss'
import {displayNameOfNetwork} from '../config/type'

type ModalId = 'none' | 'RemoveWallet' | 'Support' | 'Status'

const UpdatingStatusModal = ({
  syncStatus,
  onCancel,
}: {
  syncStatus?: SynchronizationStatus
  onCancel: () => void
}): JSX.Element => {
  const [mantisWalletStatus, setMantisWalletStatus] = useState(loadMantisWalletStatus)

  useInterval(() => setMantisWalletStatus(loadMantisWalletStatus()), 2000)

  return (
    <StatusModal
      status={mantisWalletStatus}
      config={loadConfig()}
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
    translation: {t},
  } = SettingsState.useContainer()

  const walletState = WalletState.useContainer()
  const routerState = RouterState.useContainer()
  const tokensState = TokensState.useContainer()
  const {networkName} = BackendState.useContainer()

  const [activeModal, setActiveModal] = useState<ModalId>('none')

  const LogOutButton = (): JSX.Element => {
    const classNames = ['footer-link', 'logout']

    if (walletState.walletStatus === 'LOADED' && !routerState.isLocked) {
      return (
        <span
          className={classnames(...classNames)}
          {...fillActionHandlers(() => setActiveModal('RemoveWallet'), 'link')}
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
      {networkName !== 'etc' && (
        /* eslint-disable-next-line jsx-a11y/click-events-have-key-events,jsx-a11y/no-static-element-interactions */
        <div className="ApiTestToggle" onClick={() => routerState.navigate('API_TEST')}></div>
      )}
      <div className="logo">
        <SVG src={logo} className="logo" />
      </div>
      <div className="title">
        <SVG src={wordmark} />
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
          <span className="edition">
            {' '}
            — {EDITION} — {displayNameOfNetwork(networkName)}
          </span>
        </div>
      </div>
      {canRemoveWallet(walletState) && !routerState.isLocked && (
        <RemoveWalletModal
          visible={activeModal === 'RemoveWallet'}
          onRemoveWallet={async (password: string): Promise<void> => {
            const removed = await walletState.remove(password)
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
