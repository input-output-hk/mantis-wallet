import React, {useState} from 'react'
import {WalletState} from '../common/wallet-state'
import {Navigate} from '../layout/Router'
import {Dialog} from '../common/Dialog'
import {DialogInputPassword} from '../common/dialog/DialogInput'
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
    return <Navigate to="WALLETS" />
  } else {
    return (
      <div className="WalletUnlock">
        <Dialog
          title="Unlock Wallet"
          buttonDisplayMode="natural"
          prevButtonProps={{doNotRender: true}}
          nextButtonProps={{
            children: 'Unlock',
            disabled: isLoading,
            onClick: unlock,
          }}
        >
          <DialogInputPassword
            label="Enter Password"
            errorMessage={errorMessage}
            visibilityToggle={false}
            onChange={(e): void => setPassphrase(e.target.value)}
          />
        </Dialog>
      </div>
    )
  }
}
