import React, {useState, FunctionComponent} from 'react'
import _ from 'lodash/fp'
import {Dialog} from '../../common/Dialog'
import {DialogRecoveryPhrase} from '../../common/dialog/DialogRecoveryPhrase'
import {DialogApproval} from '../../common/dialog/DialogApproval'
import {useTranslation} from '../../common/store/settings'

interface WalletCreateVerifyRecoveryStepProps {
  back: () => void
  finish: () => void
  seedPhrase: string[]
  shuffledSeedPhrase: string[]
}

export const WalletCreateVerifyRecoveryStep: FunctionComponent<WalletCreateVerifyRecoveryStepProps> = ({
  back,
  finish,
  seedPhrase,
  shuffledSeedPhrase,
}: WalletCreateVerifyRecoveryStepProps) => {
  const {t} = useTranslation()
  const [isSeedPhraseValidated, setSeedPhraseValidated] = useState(false)

  return (
    <Dialog
      title={t(['wallet', 'title', 'walletCreationRecoveryPhraseStep'])}
      leftButtonProps={{
        onClick: back,
        children: t(['common', 'button', 'oneStepBack']),
      }}
      rightButtonProps={{
        disabled: !isSeedPhraseValidated,
        children: t(['common', 'button', 'finish']),
        onClick: finish,
      }}
    >
      <DialogRecoveryPhrase
        recoveryPhraseValidation={(enteredPhrase): boolean => _.isEqual(enteredPhrase, seedPhrase)}
        setRecoveryPhraseValidated={setSeedPhraseValidated}
        recoveryPhraseShuffled={shuffledSeedPhrase}
      />
      <DialogApproval
        id="checkbox-local-only"
        description={t(['wallet', 'message', 'checkboxFinishingWalletCreationDescription1'])}
      />
      <DialogApproval
        id="checkbox-recovery"
        description={t(['wallet', 'message', 'checkboxFinishingWalletCreationDescription2'])}
      />
    </Dialog>
  )
}
