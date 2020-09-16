import React, {useState, FunctionComponent} from 'react'
import {Button} from 'antd'
import {wrapWithModal, ModalLocker, ModalOnCancel} from '../../common/LunaModal'
import {Dialog} from '../../common/Dialog'
import {DialogMessage} from '../../common/dialog/DialogMessage'
import {DialogInputPassword} from '../../common/dialog/DialogInput'
import {DialogColumns} from '../../common/dialog/DialogColumns'
import {fillActionHandlers} from '../../common/util'
import {useTranslation} from '../../settings-state'
import {Trans} from '../../common/Trans'
import './LockWalletModal.scss'

interface LockWalletModalProps extends ModalOnCancel {
  lock: (password: string) => Promise<void>
  toRemoveWallet: () => void
}

const LockWalletDialog: FunctionComponent<LockWalletModalProps> = ({
  lock,
  toRemoveWallet,
  onCancel,
}: LockWalletModalProps) => {
  const {t} = useTranslation()
  const [password, setPassword] = useState('')
  const modalLocker = ModalLocker.useContainer()

  return (
    <Dialog
      title={t(['wallet', 'title', 'logOutOfWallet'])}
      leftButtonProps={{
        onClick: onCancel,
        disabled: modalLocker.isLocked,
      }}
      rightButtonProps={{
        onClick: (): Promise<void> => lock(password),
        children: t(['wallet', 'button', 'logOutOfWallet']),
      }}
      onSetLoading={modalLocker.setLocked}
    >
      <div className="LockWalletModal">
        <DialogMessage>
          <Trans k={['wallet', 'message', 'lockWalletDescription']} />
        </DialogMessage>
        <DialogInputPassword onChange={(e) => setPassword(e.target.value)} autoFocus />
        <DialogColumns>
          <Button danger {...fillActionHandlers(toRemoveWallet)}>
            <Trans k={['wallet', 'button', 'removeWallet']} />
          </Button>
        </DialogColumns>
      </div>
    </Dialog>
  )
}

export const LockWalletModal = wrapWithModal(LockWalletDialog)
