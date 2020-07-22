import React, {useState, FunctionComponent} from 'react'
import {Option, none, isSome, some, isNone} from 'fp-ts/lib/Option'
import {CheckCircleFilled} from '@ant-design/icons'
import {LoadedState} from '../../common/wallet-state'
import {wrapWithModal, ModalLocker, ModalOnCancel} from '../../common/LunaModal'
import {Dialog} from '../../common/Dialog'
import {DialogMessage} from '../../common/dialog/DialogMessage'
import {DialogInputPassword} from '../../common/dialog/DialogInput'
import {DialogSwitch} from '../../common/dialog/DialogSwitch'
import {DialogQRCode} from '../../common/dialog/DialogQRCode'

import './ExportPrivateKey.scss'

const PasswordStep = ({
  setPassphrase,
}: {
  setPassphrase: React.Dispatch<React.SetStateAction<string>>
}): JSX.Element => (
  <>
    <DialogMessage>Enter your password to export your private key.</DialogMessage>
    <DialogInputPassword onChange={(e) => setPassphrase(e.target.value)} autoFocus />
  </>
)

const RevealStep = ({privateKey}: {privateKey: string}): JSX.Element => {
  const [isRevealed, reveal] = useState(false)

  return (
    <>
      <DialogSwitch
        autoFocus
        key="reveal-private-key-switch"
        label="Reveal Private Key"
        description="Please, make sure your screen is not visible to anyone but you to ensure security"
        checked={isRevealed}
        onChange={reveal}
      ></DialogSwitch>
      <div>
        <DialogQRCode
          content={privateKey}
          downloadFileName="Luna-wallet-spending-key"
          blurred={!isRevealed}
        />
      </div>
    </>
  )
}

interface ExportPrivateKeyModalProps extends ModalOnCancel {
  getSpendingKey: LoadedState['getSpendingKey']
}

const ExportPrivateKeyDialog: FunctionComponent<ExportPrivateKeyModalProps> = ({
  getSpendingKey,
  onCancel,
}: ExportPrivateKeyModalProps) => {
  const [passphrase, setPassphrase] = useState('')
  const [privateKey, setPrivateKey] = useState<Option<string>>(none)

  const modalLocker = ModalLocker.useContainer()

  return (
    <Dialog
      title="Export Private Key"
      className="ExportPrivateKey"
      leftButtonProps={{
        children: 'Close',
        onClick: onCancel,
        disabled: modalLocker.isLocked,
      }}
      rightButtonProps={{
        onClick: async (): Promise<void> => {
          const privateKey = await getSpendingKey({passphrase})
          setPrivateKey(some(privateKey))
        },
        children: 'Unlock',
        disabled: modalLocker.isLocked || isSome(privateKey),
        icon: isSome(privateKey) && <CheckCircleFilled />,
      }}
      onSetLoading={modalLocker.setLocked}
    >
      {isNone(privateKey) ? (
        <PasswordStep setPassphrase={setPassphrase} />
      ) : (
        <RevealStep privateKey={privateKey.value} />
      )}
    </Dialog>
  )
}

export const ExportPrivateKeyModal = wrapWithModal(ExportPrivateKeyDialog)
