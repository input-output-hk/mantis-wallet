import React, {useState, FunctionComponent} from 'react'
import {wrapWithModal, ModalLocker, ModalOnCancel} from '../../common/LunaModal'
import {Dialog} from '../../common/Dialog'
import {DialogMessage} from '../../common/dialog/DialogMessage'
import {DialogInputPassword} from '../../common/dialog/DialogInput'
import {fillActionHandlers} from '../../common/util'
import './LockWalletModal.scss'

interface LockWalletModalProps extends ModalOnCancel {
  lock: (passphrase: string) => Promise<void>
  toRemoveWallet: () => void
}

const LockWalletDialog: FunctionComponent<LockWalletModalProps> = ({
  lock,
  toRemoveWallet,
  onCancel,
}: LockWalletModalProps) => {
  const [passphrase, setPassphrase] = useState('')
  const modalLocker = ModalLocker.useContainer()

  return (
    <Dialog
      title="Log Out"
      leftButtonProps={{
        onClick: onCancel,
        disabled: modalLocker.isLocked,
      }}
      rightButtonProps={{
        onClick: (): Promise<void> => lock(passphrase),
        children: 'Log Out',
      }}
      onSetLoading={modalLocker.setLocked}
    >
      <div className="LockWalletModal">
        <DialogMessage>
          Enter your password to lock your wallet. You can access your wallet later by unlocking it
          with your password.
        </DialogMessage>
        <DialogInputPassword onChange={(e) => setPassphrase(e.target.value)} autoFocus />
        <div className="remove-link" {...fillActionHandlers(toRemoveWallet)}>
          Remove Wallet
        </div>
      </div>
    </Dialog>
  )
}

export const LockWalletModal = wrapWithModal(LockWalletDialog)
