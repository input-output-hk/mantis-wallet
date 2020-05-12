import React, {useState} from 'react'
import {wrapWithModal, ModalLocker, ModalOnCancel} from '../../common/LunaModal'
import {Dialog} from '../../common/Dialog'
import {DialogMessage} from '../../common/dialog/DialogMessage'
import {DialogInputPassword} from '../../common/dialog/DialogInput'
import {DialogApproval} from '../../common/dialog/DialogApproval'

interface LogOutModalProps extends ModalOnCancel {
  onLogOut: (passphrase: string) => Promise<void>
}

const LogOutDialog: React.FunctionComponent<LogOutModalProps> = ({
  onLogOut,
  onCancel,
}: LogOutModalProps) => {
  const [approve, setApprove] = useState(false)
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
        onClick: (): Promise<void> => onLogOut(passphrase),
        disabled: !approve,
        children: 'Log Out',
      }}
      onSetLoading={modalLocker.setLocked}
    >
      <DialogMessage description="Enter your password to log out." />
      <DialogInputPassword onChange={(e) => setPassphrase(e.target.value)} autoFocus />
      <DialogApproval
        checked={approve}
        onChange={setApprove}
        description="I understand that all my Burn Addresses and Glacier Drop Claims will be deleted from this machine."
      />
    </Dialog>
  )
}

export const LogOutModal = wrapWithModal(LogOutDialog)
