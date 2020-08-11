import React, {useState} from 'react'
import {WalletState} from '../common/wallet-state'
import {Navigate} from '../layout/Router'
import {Dialog} from '../common/Dialog'
import {DialogInputPassword} from '../common/dialog/DialogInput'
import {useTranslation} from '../settings-state'
import './WalletUnlock.scss'

export const WalletUnlock = (): JSX.Element => {
  const {t, translateError} = useTranslation()
  const walletState = WalletState.useContainer()
  const isLocked = walletState.walletStatus === 'LOCKED'

  const [errorMessage, setErrorMessage] = useState<string>('')
  const [passphrase, setPassphrase] = useState<string>('')

  const unlock = async (): Promise<void> => {
    if (walletState.walletStatus !== 'LOCKED') return

    try {
      await walletState.unlock({passphrase})
    } catch (e) {
      setErrorMessage(translateError(e))
    }
  }

  if (!isLocked) {
    return <Navigate to="WALLETS" />
  } else {
    return (
      <div className="WalletUnlock">
        <Dialog
          title={t(['wallet', 'title', 'unlockWallet'])}
          buttonDisplayMode="natural"
          leftButtonProps={{doNotRender: true}}
          rightButtonProps={{
            children: t(['wallet', 'button', 'unlockWallet']),
            onClick: unlock,
          }}
        >
          <DialogInputPassword
            autoFocus
            label={t(['wallet', 'label', 'enterPassword'])}
            errorMessage={errorMessage}
            onChange={(e): void => setPassphrase(e.target.value)}
          />
        </Dialog>
      </div>
    )
  }
}
