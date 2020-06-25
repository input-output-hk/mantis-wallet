import React, {useState} from 'react'
import {wrapWithModal, ModalLocker, ModalOnCancel} from '../../common/LunaModal'
import {Dialog} from '../../common/Dialog'
import {DialogMessage} from '../../common/dialog/DialogMessage'
import {DialogInputPassword} from '../../common/dialog/DialogInput'
import {DialogApproval} from '../../common/dialog/DialogApproval'

interface RemoveWalletModalProps extends ModalOnCancel {
  onRemoveWallet: (passphrase: string) => Promise<void>
}

const RemoveWalletDialog: React.FunctionComponent<RemoveWalletModalProps> = ({
  onRemoveWallet,
  onCancel,
}: RemoveWalletModalProps) => {
  const [passphrase, setPassphrase] = useState('')
  const modalLocker = ModalLocker.useContainer()

  return (
    <Dialog
      title="Remove Wallet"
      leftButtonProps={{
        onClick: onCancel,
        disabled: modalLocker.isLocked,
      }}
      rightButtonProps={{
        onClick: (): Promise<void> => onRemoveWallet(passphrase),
        children: 'Remove Wallet',
      }}
      onSetLoading={modalLocker.setLocked}
    >
      <DialogMessage>Enter your password to remove your wallet.</DialogMessage>
      <DialogInputPassword onChange={(e) => setPassphrase(e.target.value)} autoFocus />
      <DialogApproval
        id="restore-warning"
        description="I understand that I won't be able to restore this wallet and access my funds if I didn't save my private key or seed phrase."
      />
      <DialogApproval
        id="delete-data-warning"
        description="I understand that all my Burn Addresses and Glacier Drop Claims will be deleted from this machine."
      />
    </Dialog>
  )
}

export const RemoveWalletModal = wrapWithModal(RemoveWalletDialog)
