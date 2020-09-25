import React, {useState, FunctionComponent} from 'react'
import {Dialog} from '../../common/Dialog'
import {DialogMessage} from '../../common/dialog/DialogMessage'
import {DialogSwitch} from '../../common/dialog/DialogSwitch'
import {DialogQRCode} from '../../common/dialog/DialogQRCode'
import {useTranslation} from '../../settings-state'
import {Trans} from '../../common/Trans'

interface WalletCreateSecurityStepProps {
  cancel: () => void
  next: () => void
  privateKey: string
}

export const WalletCreateSecurityStep: FunctionComponent<WalletCreateSecurityStepProps> = ({
  cancel,
  next,
  privateKey,
}: WalletCreateSecurityStepProps) => {
  const {t} = useTranslation()
  const [usePrivateKey, setUsePrivateKey] = useState(false)

  return (
    <Dialog
      title={t(['wallet', 'title', 'walletCreationSecurityStep'])}
      leftButtonProps={{onClick: cancel}}
      rightButtonProps={{onClick: next}}
    >
      <DialogMessage label="Recovery Phrase">
        <Trans k={['wallet', 'message', 'securityRecoveryPhraseDescription']} />
      </DialogMessage>
      <DialogSwitch
        autoFocus
        key="private-key-switch"
        label={t(['wallet', 'label', 'privateKey'])}
        description={t(['wallet', 'message', 'showPrivateKeyDescription'])}
        checked={usePrivateKey}
        onChange={setUsePrivateKey}
      />
      <DialogQRCode
        content={privateKey}
        downloadFileName="Luna-wallet-private-key"
        blurred={!usePrivateKey}
      />
    </Dialog>
  )
}
