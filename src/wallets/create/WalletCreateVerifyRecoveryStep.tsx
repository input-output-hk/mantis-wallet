import React, {useState} from 'react'
import _ from 'lodash/fp'
import {Dialog} from '../../common/Dialog'
import {DialogRecoveryPhrase} from '../../common/dialog/DialogRecoveryPhrase'
import {DialogApproval} from '../../common/dialog/DialogApproval'

interface WalletCreateVerifyRecoveryStepProps {
  back: () => void
  finish: () => void
  recoveryPhrase: string[]
}

export const WalletCreateVerifyRecoveryStep: React.FunctionComponent<WalletCreateVerifyRecoveryStepProps> = ({
  back,
  finish,
  recoveryPhrase,
}: WalletCreateVerifyRecoveryStepProps) => {
  const [isRecoveryPhraseValidated, setRecoveryPhraseValidated] = useState(false)
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
        disabled: !isCondition1 || !isCondition2 || !isRecoveryPhraseValidated,
        children: 'Finish',
        onClick: finish,
      }}
    >
      <DialogRecoveryPhrase
        recoveryPhraseValidation={(enteredPhrase): boolean =>
          _.isEqual(enteredPhrase, recoveryPhrase)
        }
        setRecoveryPhraseValidated={setRecoveryPhraseValidated}
        recoveryPhraseShuffled={_.shuffle(recoveryPhrase)}
      />
      <DialogApproval
        description="Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna"
        checked={isCondition1}
        onChange={setCondition1}
      />
      <DialogApproval
        description="Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna"
        checked={isCondition2}
        onChange={setCondition2}
      />
    </Dialog>
  )
}
