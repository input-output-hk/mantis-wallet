import React, {useState} from 'react'
import {Dialog} from '../../common/Dialog'
import {DialogMessage} from '../../common/dialog/DialogMessage'
import {DialogApproval} from '../../common/dialog/DialogApproval'
import {DialogDisplayWords} from '../../common/dialog/DialogDisplayWords'

interface WalletCreateDisplayRecoveryStepProps {
  back: () => void
  next: () => void
  seedPhrase: string[]
}

export const WalletCreateDisplayRecoveryStep: React.FunctionComponent<WalletCreateDisplayRecoveryStepProps> = ({
  back,
  next,
  seedPhrase,
}: WalletCreateDisplayRecoveryStepProps) => {
  const [isRecoveryPhraseWritten, setRecoveryPhraseWritten] = useState(false)

  return (
    <Dialog
      title="Recovery Phrase"
      leftButtonProps={{
        onClick: back,
        children: 'Back',
      }}
      rightButtonProps={{
        onClick: next,
        disabled: !isRecoveryPhraseWritten,
      }}
    >
      <DialogMessage description="This is your wallet backup phrase. It can be entered into any version of Luna Wallet in order to restore your wallet" />
      <DialogMessage description="The phrase is case sensitive. Please make sure you write down and save your recovery phrase. You will need this phrase to use and restore your wallet" />
      <DialogDisplayWords words={seedPhrase} />
      <DialogApproval
        autoFocus
        description="Yes, I have written it down."
        checked={isRecoveryPhraseWritten}
        onChange={setRecoveryPhraseWritten}
      />
    </Dialog>
  )
}
