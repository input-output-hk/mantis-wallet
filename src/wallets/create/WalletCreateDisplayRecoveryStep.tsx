import React from 'react'
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
  return (
    <Dialog
      title="Recovery Phrase"
      leftButtonProps={{
        onClick: back,
        children: 'Back',
      }}
      rightButtonProps={{
        onClick: next,
      }}
    >
      <DialogMessage>
        This is your wallet backup phrase. It can be entered into any version of Luna Wallet in
        order to restore your wallet
      </DialogMessage>
      <DialogMessage>
        The phrase is case sensitive. Please, make sure you write down and save your recovery
        phrase. You will need this phrase to use and restore your wallet
      </DialogMessage>
      <DialogDisplayWords words={seedPhrase} />
      <DialogApproval id="written-down" description="Yes, I have written it down." autoFocus />
    </Dialog>
  )
}
