import React, {useState} from 'react'
import {Dialog} from '../../common/Dialog'
import {DialogMessage} from '../../common/dialog/DialogMessage'
import {DialogApproval} from '../../common/dialog/DialogApproval'

interface WalletCreateDisplayRecoveryStepProps {
  back: () => void
  next: () => void
}

export const WalletCreateDisplayRecoveryStep: React.FunctionComponent<WalletCreateDisplayRecoveryStepProps> = ({
  back,
  next,
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
      <DialogApproval
        description="Yes, I have written it down."
        checked={isRecoveryPhraseWritten}
        onChange={setRecoveryPhraseWritten}
      />
    </Dialog>
  )
}
