import React, {useState} from 'react'
import {Redirect} from 'react-router-dom'
import {Button} from 'antd'
import {WalletState} from '../common/wallet-state'
import {BorderlessInputPassword} from '../common/BorderlessInput'
import {wallet} from '../wallet'
import {ROUTES} from '../routes-config'
import './WalletUnlock.scss'

type UnlockStatus = 'LOCKED' | 'UNLOCKED' | 'LOADING'

export const WalletUnlock = (): JSX.Element => {
  const walletState = WalletState.useContainer()
  const [unlockStatus, setUnlockStatus] = useState<UnlockStatus>('LOCKED')
  const [errorMessage, setErrorMessage] = useState<string>('')
  const [passphrase, setPassphrase] = useState<string>('')

  const unlock = (): void => {
    setUnlockStatus('LOADING')
    wallet
      .unlock({passphrase})
      .then((result: boolean) => setUnlockStatus(result ? 'UNLOCKED' : 'LOCKED'))
      .catch((e: Error) => {
        setUnlockStatus('LOCKED')
        setErrorMessage(e.message)
      })
  }

  if (unlockStatus === 'UNLOCKED') {
    if (walletState.walletStatus === 'ERROR') walletState.reset()
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
          <Button type="primary" disabled={unlockStatus === 'LOADING'} onClick={unlock}>
            Unlock
          </Button>
        </div>
      </div>
    )
  }
}
