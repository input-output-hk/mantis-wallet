import React, {useState} from 'react'
import _ from 'lodash/fp'
import {Dialog} from '../../common/Dialog'
import {DialogRecoveryPhrase} from '../../common/dialog/DialogRecoveryPhrase'
import {DialogApproval} from '../../common/dialog/DialogApproval'

interface WalletCreateVerifyRecoveryStepProps {
  back: () => void
  finish: () => void
  seedPhrase: string[]
}

export const WalletCreateVerifyRecoveryStep: React.FunctionComponent<WalletCreateVerifyRecoveryStepProps> = ({
  back,
  finish,
  seedPhrase,
}: WalletCreateVerifyRecoveryStepProps) => {
  const [isSeedPhraseValidated, setSeedPhraseValidated] = useState(false)
  const [isCondition1, setCondition1] = useState(false)
  const [isCondition2, setCondition2] = useState(false)

  return (
    <Dialog
      title="Recovery Phrase"
      prevButtonProps={{
        onClick: back,
        children: 'Back',
      }}
      nextButtonProps={{
        disabled: !isCondition1 || !isCondition2 || !isSeedPhraseValidated,
        children: 'Finish',
        onClick: finish,
      }}
    >
      <DialogRecoveryPhrase
        recoveryPhraseValidation={(enteredPhrase): boolean => _.isEqual(enteredPhrase, seedPhrase)}
        setRecoveryPhraseValidated={setSeedPhraseValidated}
        recoveryPhraseShuffled={_.shuffle(seedPhrase)}
      />
      <DialogApproval
        description="I understand that my wallet and tokens are held securely on this device only and not on any servers"
        checked={isCondition1}
        onChange={setCondition1}
      />
      <DialogApproval
        description="I understand that if this application is moved to another device or is deleted, my wallet can only be recovered with the backup phrase I have written down and stored securely"
        checked={isCondition2}
        onChange={setCondition2}
      />
    </Dialog>
  )
}
