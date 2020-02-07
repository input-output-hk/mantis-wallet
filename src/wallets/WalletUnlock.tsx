import React, {useState} from 'react'
import {Redirect} from 'react-router-dom'
import {Button} from 'antd'
import {WalletState} from '../common/wallet-state'
import {BorderlessInputPassword} from '../common/BorderlessInput'
import {ROUTES} from '../routes-config'
import './WalletUnlock.scss'

export const WalletUnlock = (): JSX.Element => {
  const state = WalletState.useContainer()
  const isLocked = state.walletStatus === 'LOCKED'

  const [isLoading, setLoading] = useState<boolean>(false)
  const [errorMessage, setErrorMessage] = useState<string>('')
  const [passphrase, setPassphrase] = useState<string>('')

  const unlock = async (): Promise<void> => {
    if (state.walletStatus !== 'LOCKED' || isLoading) return

    setLoading(true)
    try {
      await state.unlock({passphrase})
    } catch (e) {
      setErrorMessage(e.message)
      setLoading(false)
    }
  }

  if (!isLocked) {
    return <Redirect to={ROUTES.WALLETS.path} />
  } else {
    return (
      <div className="WalletUnlock">
        <div className="dialog">
          <h1>Unlock Wallet</h1>
          <div className="label">Enter Password</div>
          <BorderlessInputPassword
            className="input"
            errorMessage={errorMessage}
            visibilityToggle={false}
            onChange={(e): void => setPassphrase(e.target.value)}
            onKeyDown={(e): void => {
              if (e.key === 'Enter') unlock()
            }}
          />
          <Button type="primary" disabled={isLoading} onClick={unlock}>
            Unlock
          </Button>
        </div>
      </div>
    )
  }
}
