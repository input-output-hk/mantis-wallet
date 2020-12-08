import React, {useState} from 'react'
import SVG from 'react-inlinesvg'
import classnames from 'classnames'
import {Button} from 'antd'
import {shell} from 'electron'
import {SettingsState} from '../settings-state'
import {RouterState} from '../router-state'
import {MENU, MenuId, MenuItem} from '../routes-config'
import {loadMantisWalletStatus, loadConfig} from '../config/renderer'
import {useInterval} from '../common/hook-utils'
import {WalletState, canRemoveWallet, SynchronizationStatus} from '../common/wallet-state'
import {SyncStatus} from '../common/SyncStatus'
import {StatusModal} from '../common/StatusModal'
import {SupportModal} from '../common/SupportModal'
import {fillActionHandlers} from '../common/util'
import {BalanceDisplay} from '../wallets/BalanceDisplay'
import {RemoveWalletModal} from '../wallets/modals/RemoveWalletModal'
import {BackendState} from '../common/backend-state'
import {TokensState} from '../tokens/tokens-state'
import {Trans} from '../common/Trans'
import {createTErrorRenderer} from '../common/i18n'
import logoDark from '../assets/logo-lockup-dark.svg'
import logoLight from '../assets/logo-lockup-light.svg'
import './Sidebar.scss'

type ModalId = 'none' | 'RemoveWallet' | 'Support' | 'Status'

const FAUCET_URL = 'https://mantis-testnet-faucet-web.mantis.ws'

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

export const Sidebar = (): JSX.Element => {
  const {
    translation: {t},
    theme,
  } = SettingsState.useContainer()

  const walletState = WalletState.useContainer()
  const routerState = RouterState.useContainer()
  const tokensState = TokensState.useContainer()
  const {networkName} = BackendState.useContainer()

  const [activeModal, setActiveModal] = useState<ModalId>('none')

  const logo = theme === 'dark' ? logoDark : logoLight

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

      <div className="logo-wrapper">
        <div className="logo">
          <SVG src={logo} className="logo" />
        </div>
      </div>

      <div className="sync-status-wrapper">
        <SyncStatus />
      </div>

      <div className="flex-content">
        <div className="flex-item">
          <nav>
            <ul className={classnames('navigation', {locked: routerState.isLocked})}>
              {Object.entries(MENU).map(([menuId, menuItem]: [string, MenuItem]) => {
                const isActive = routerState.currentRoute.menu === menuId
                const classes = classnames('link', menuId.toLowerCase(), {active: isActive})
                return (
                  <li key={menuId}>
                    <div
                      className={classes}
                      {...fillActionHandlers(() => handleMenuClick(menuId as MenuId), 'link')}
                    >
                      {t(menuItem.title)}
                    </div>
                  </li>
                )
              })}
            </ul>
          </nav>
        </div>
        <div className="balance-wrapper flex-item">
          {walletState.walletStatus === 'LOADED' && (
            <>
              <BalanceDisplay availableBalance={walletState.getOverviewProps().availableBalance} />
              <div className="faucet-button">
                {networkName === 'testnet-internal-nomad' && (
                  <Button
                    data-testid="faucet-button"
                    type="default"
                    className="action"
                    {...fillActionHandlers((): void => {
                      shell.openExternal(FAUCET_URL)
                    })}
                  >
                    {t(['wallet', 'button', 'getTestETC'])}
                  </Button>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      <div className="footer">
        <span
          className="footer-link support"
          {...fillActionHandlers(() => setActiveModal('Support'), 'link')}
        >
          <Trans k={['common', 'link', 'support']} />
        </span>
        <span
          className="footer-link status"
          {...fillActionHandlers(() => setActiveModal('Status'), 'link')}
        >
          <Trans k={['common', 'link', 'status']} />
        </span>
        <LogOutButton />
      </div>

      {/* Modals: */}
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

      {/* Beta banner */}
      <div className="beta-banner">BETA</div>
    </header>
  )
}
