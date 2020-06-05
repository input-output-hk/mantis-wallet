import React, {useState} from 'react'
import {WalletState} from '../common/wallet-state'
import {Navigate} from '../layout/Router'
import {Dialog} from '../common/Dialog'
import {DialogInputPassword} from '../common/dialog/DialogInput'
import './WalletUnlock.scss'

export const WalletUnlock = (): JSX.Element => {
  const walletState = WalletState.useContainer()
  const isLocked = walletState.walletStatus === 'LOCKED'

  const [errorMessage, setErrorMessage] = useState<string>('')
  const [passphrase, setPassphrase] = useState<string>('')

  const unlock = async (): Promise<void> => {
    if (walletState.walletStatus !== 'LOCKED') return

    try {
      await walletState.unlock({passphrase})
    } catch (e) {
      setErrorMessage(e.message)
    }
  }

  if (!isLocked) {
    return <Navigate to="WALLETS" />
  } else {
    return (
      <div className="WalletUnlock">
        <Dialog
          title="Unlock Wallet"
          buttonDisplayMode="natural"
          leftButtonProps={{doNotRender: true}}
          rightButtonProps={{
            children: 'Unlock',
            onClick: unlock,
          }}
        >
          <DialogInputPassword
            autoFocus
            label="Enter Password"
            errorMessage={errorMessage}
            onChange={(e): void => setPassphrase(e.target.value)}
          />
        </Dialog>
      </div>
    )
  }
}
