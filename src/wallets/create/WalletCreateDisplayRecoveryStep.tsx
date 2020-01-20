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
      prevButtonProps={{
        onClick: back,
        children: 'Back',
      }}
      nextButtonProps={{
        onClick: next,
        disabled: !isRecoveryPhraseWritten,
      }}
    >
      <DialogMessage description="Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna" />
      <DialogDisplayWords words={seedPhrase} />
      <DialogApproval
        description="Yes, I have written it down."
        checked={isRecoveryPhraseWritten}
        onChange={setRecoveryPhraseWritten}
      />
    </Dialog>
  )
}
