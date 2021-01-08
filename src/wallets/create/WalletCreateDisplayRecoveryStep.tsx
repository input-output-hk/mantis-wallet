import React, {FunctionComponent} from 'react'
import {Dialog} from '../../common/Dialog'
import {DialogMessage} from '../../common/dialog/DialogMessage'
import {DialogApproval} from '../../common/dialog/DialogApproval'
import {DialogDisplayWords} from '../../common/dialog/DialogDisplayWords'
import {useTranslation} from '../../common/store/settings'
import {Trans} from '../../common/Trans'

interface WalletCreateDisplayRecoveryStepProps {
  back: () => void
  next: () => void
  seedPhrase: string[]
}

export const WalletCreateDisplayRecoveryStep: FunctionComponent<WalletCreateDisplayRecoveryStepProps> = ({
  back,
  next,
  seedPhrase,
}: WalletCreateDisplayRecoveryStepProps) => {
  const {t} = useTranslation()
  return (
    <Dialog
      title={t(['wallet', 'title', 'walletCreationRecoveryPhraseStep'])}
      leftButtonProps={{
        onClick: back,
        children: t(['common', 'button', 'oneStepBack']),
      }}
      rightButtonProps={{
        onClick: next,
      }}
    >
      <DialogMessage>
        <Trans k={['wallet', 'message', 'recoveryPhraseDescription1']} />
      </DialogMessage>
      <DialogMessage>
        <Trans k={['wallet', 'message', 'recoveryPhraseDescription2']} />
      </DialogMessage>
      <DialogDisplayWords words={seedPhrase} />
      <DialogApproval
        id="written-down"
        description={t(['wallet', 'message', 'recoveryPhraseApproval'])}
        autoFocus
      />
    </Dialog>
  )
}
