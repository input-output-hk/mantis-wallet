import React, {useState, FunctionComponent} from 'react'
import {wrapWithModal, ModalLocker, ModalOnCancel} from '../../common/MantisModal'
import {Dialog} from '../../common/Dialog'
import {DialogMessage} from '../../common/dialog/DialogMessage'
import {DialogInputPassword} from '../../common/dialog/DialogInput'
import {DialogApproval} from '../../common/dialog/DialogApproval'
import {useTranslation} from '../../common/store/settings'

interface RemoveWalletModalProps extends ModalOnCancel {
  onRemoveWallet: (password: string) => Promise<void>
}

const RemoveWalletDialog: FunctionComponent<RemoveWalletModalProps> = ({
  onRemoveWallet,
  onCancel,
}: RemoveWalletModalProps) => {
  const {t} = useTranslation()
  const [password, setPassphrase] = useState('')
  const modalLocker = ModalLocker.useContainer()

  return (
    <Dialog
      title={t(['wallet', 'title', 'removeWallet'])}
      leftButtonProps={{
        onClick: onCancel,
        disabled: modalLocker.isLocked,
      }}
      rightButtonProps={{
        onClick: (): Promise<void> => onRemoveWallet(password),
        children: t(['wallet', 'button', 'removeWallet']),
        danger: true,
      }}
      onSetLoading={modalLocker.setLocked}
    >
      <DialogMessage>{t(['wallet', 'message', 'removeWalletInstruction'])}</DialogMessage>
      <DialogInputPassword onChange={(e) => setPassphrase(e.target.value)} autoFocus />
      <DialogApproval
        id="restore-warning"
        description={t(['wallet', 'message', 'removeWalletApproval1'])}
      />
      <DialogApproval
        id="delete-data-warning"
        description={t(['wallet', 'message', 'removeWalletApproval2'])}
      />
    </Dialog>
  )
}

export const RemoveWalletModal = wrapWithModal(RemoveWalletDialog)
