import React, {useState} from 'react'
import {NavLink} from 'react-router-dom'
import SVG from 'react-inlinesvg'
import classnames from 'classnames'
import {WalletState, canRemoveWallet} from '../common/wallet-state'
import {ROUTES} from '../routes-config'
import {LogOutModal} from '../wallets/modals/LogOutModal'
import lunaLogo from '../assets/luna-small.svg'
import './Sidebar.scss'

export const Sidebar = (): JSX.Element => {
  const [showLogOutModal, setShowLogOutModal] = useState(false)

  const walletState = WalletState.useContainer()

  const logOut = canRemoveWallet(walletState) ? (
    <span className="link" onClick={() => setShowLogOutModal(true)}>
      Log Out
    </span>
  ) : (
    <span className={classnames('link', 'disabled')}>Log Out</span>
  )

  return (
    <div className="Sidebar">
      <div className="logo">
        <SVG src={lunaLogo} alt="logo" />
      </div>
      <div>
        <h1 className="title">Luna</h1>
      </div>
      <div>
        <nav>
          <ul className="navigation">
            {Object.values(ROUTES)
              .filter((route) => !route.hidden)
              .map((route) => (
                <li key={route.path}>
                  <NavLink to={route.path} className="link">
                    <span className="prefix">&nbsp;</span>
                    <span className="icon">
                      &nbsp;
                      <SVG className="svg" src={route.icon} />
                    </span>
                    <span>{route.title}</span>
                  </NavLink>
                </li>
              ))}
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
