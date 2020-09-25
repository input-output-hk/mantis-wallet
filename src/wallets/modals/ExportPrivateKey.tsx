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
import {Trans} from '../../common/Trans'
import {useTranslation} from '../../settings-state'
import './ExportPrivateKey.scss'

const PasswordStep = ({
  setPassphrase,
}: {
  setPassphrase: React.Dispatch<React.SetStateAction<string>>
}): JSX.Element => (
  <>
    <DialogMessage>
      <Trans k={['wallet', 'message', 'exportPrivateKey']} />
    </DialogMessage>
    <DialogInputPassword onChange={(e) => setPassphrase(e.target.value)} autoFocus />
  </>
)

const RevealStep = ({privateKey}: {privateKey: string}): JSX.Element => {
  const {t} = useTranslation()
  const [isRevealed, reveal] = useState(false)

  return (
    <>
      <DialogSwitch
        autoFocus
        key="reveal-private-key-switch"
        label={t(['wallet', 'label', 'revealPrivateKey'])}
        description={t(['wallet', 'message', 'showPrivateKeyDescription'])}
        checked={isRevealed}
        onChange={reveal}
      ></DialogSwitch>
      <div>
        <DialogQRCode
          content={privateKey}
          downloadFileName="Luna-wallet-private-key"
          blurred={!isRevealed}
        />
      </div>
    </>
  )
}

interface ExportPrivateKeyModalProps extends ModalOnCancel {
  getPrivateKey: LoadedState['getPrivateKey']
}

const ExportPrivateKeyDialog: FunctionComponent<ExportPrivateKeyModalProps> = ({
  getPrivateKey,
  onCancel,
}: ExportPrivateKeyModalProps) => {
  const {t} = useTranslation()
  const [password, setPassword] = useState('')
  const [privateKey, setPrivateKey] = useState<Option<string>>(none)

  const modalLocker = ModalLocker.useContainer()

  return (
    <Dialog
      title={t(['wallet', 'title', 'exportPrivateKey'])}
      className="ExportPrivateKey"
      leftButtonProps={{
        children: t(['common', 'button', 'closeModal']),
        onClick: onCancel,
        disabled: modalLocker.isLocked,
      }}
      rightButtonProps={{
        onClick: async (): Promise<void> => {
          const privateKey = await getPrivateKey(password)
          setPrivateKey(some(privateKey))
        },
        children: t(['wallet', 'button', 'unlockPrivateKey']),
        disabled: modalLocker.isLocked || isSome(privateKey),
        icon: isSome(privateKey) && <CheckCircleFilled />,
      }}
      onSetLoading={modalLocker.setLocked}
    >
      {isNone(privateKey) ? (
        <PasswordStep setPassphrase={setPassword} />
      ) : (
        <RevealStep privateKey={privateKey.value} />
      )}
    </Dialog>
  )
}

export const ExportPrivateKeyModal = wrapWithModal(ExportPrivateKeyDialog)
