import React, {useState} from 'react'
import {Dialog} from '../../common/Dialog'
import {DialogMessage} from '../../common/dialog/DialogMessage'
import {DialogSwitch} from '../../common/dialog/DialogSwitch'
import {DialogPrivateKey} from '../../common/dialog/DialogPrivateKey'

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
      prevButtonProps={{onClick: cancel, children: 'Cancel'}}
      nextButtonProps={{onClick: next}}
    >
      <DialogMessage
        label="Recovery Phrase"
        description="On the following Screen you will see a 12 Word Phrase. This is your wallet backup phrase. It can be entered in any version of Luna in order to restore your wallet."
      />
      <DialogSwitch
        key="private-key-switch"
        label="Private Key"
        description="Please make sure your screen is not visible to anyone but you to ensure security"
        checked={useSpendingKey}
        onChange={setUseSpendingKey}
      />
      {useSpendingKey && (
        <DialogPrivateKey privateKey={spendingKey} downloadFileName="Luna-wallet-spending-key" />
      )}
    </Dialog>
  )
}
