import React, {useState} from 'react'
import {Redirect} from 'react-router-dom'
import {wallet} from '../wallet'
import {ROUTES} from '../routes-config'
import {WalletState} from '../common/wallet-state'

type UnlockStatus = 'LOCKED' | 'UNLOCKED' | 'LOADING'

export const WalletUnlock = (): JSX.Element => {
  const walletState = WalletState.useContainer()
  const [unlockStatus, setUnlockStatus] = useState<UnlockStatus>('LOCKED')

  const passphrase = 'Foobar1234'

  const unlock = (): void => {
    setUnlockStatus('LOADING')

    wallet
      .unlock({passphrase})
      .then((result: boolean) => setUnlockStatus(result ? 'UNLOCKED' : 'LOCKED'))
      .catch((e: Error) => {
        setUnlockStatus('LOCKED')
        console.error(e.message)
      })
  }

  if (unlockStatus === 'UNLOCKED') {
    if (walletState.walletStatus === 'ERROR') {
      walletState.reset()
    }
    return <Redirect to={ROUTES.WALLETS.path} />
  } else {
    return (
      <div>
        {unlockStatus}
        <br />
        <button onClick={unlock} style={{color: 'black'}}>
          Unlock
        </button>
      </div>
    )
  }
}
