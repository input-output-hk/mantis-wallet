import React, {useState} from 'react'
import {Dialog} from '../../common/Dialog'
import {DialogMessage} from '../../common/dialog/DialogMessage'
import {DialogSwitch} from '../../common/dialog/DialogSwitch'
import {DialogQRCode} from '../../common/dialog/DialogQRCode'
import {DialogApproval} from '../../common/dialog/DialogApproval'

interface WalletCreateSecurityStepProps {
  cancel: () => void
  next: () => void
  spendingKey: string
}

export const WalletCreateSecurityStep: React.FunctionComponent<WalletCreateSecurityStepProps> = ({
  cancel,
  next,
  spendingKey,
}: WalletCreateSecurityStepProps) => {
  const [useSpendingKey, setUseSpendingKey] = useState(false)

  return (
    <Dialog
      title="Security"
      leftButtonProps={{onClick: cancel, children: 'Cancel'}}
      rightButtonProps={{onClick: next}}
    >
      <DialogMessage
        label="Recovery Phrase"
        description="On the following Screen you will see a 12 Word Phrase. This is your wallet backup phrase. It can be entered in any version of Luna in order to restore your wallet."
      />
      <DialogApproval
        id="pk-needed-for-mining"
        description="I understand that I need to save my private key to enable mining in the future."
      />
      <DialogSwitch
        autoFocus
        key="private-key-switch"
        label="Private Key"
        description="Please, make sure your screen is not visible to anyone but you to ensure security"
        checked={useSpendingKey}
        onChange={setUseSpendingKey}
      />
      {useSpendingKey && (
        <DialogQRCode content={spendingKey} downloadFileName="Luna-wallet-spending-key" />
      )}
    </Dialog>
  )
}
