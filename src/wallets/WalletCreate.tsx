import React, {useState} from 'react'
import _ from 'lodash/fp'
import {Dialog} from '../common/Dialog'
import {DialogInput} from '../common/dialog/DialogInput'
import {DialogSwitch} from '../common/dialog/DialogSwitch'
import {DialogPassword} from '../common/dialog/DialogPassword'
import {DialogMessage} from '../common/dialog/DialogMessage'
import {DialogPrivateKey} from '../common/dialog/DialogPrivateKey'
import {DialogApproval} from '../common/dialog/DialogApproval'
import {DialogRecoveryPhrase} from '../common/dialog/DialogRecoveryPhrase'

interface WalletCreateProps {
  cancel: () => void
}

type WalletCreateSteps = 'DEFINE' | 'SECURITY' | 'DISPLAY_RECOVERY' | 'VERIFY_RECOVERY'

export const WalletCreate: React.FunctionComponent<WalletCreateProps> = ({
  cancel,
}: WalletCreateProps) => {
  const [usePassword, setUsePassword] = useState(false)
  const [usePrivateKey, setUsePrivateKey] = useState(false)
  const [isRecoveryPhraseWritten, setRecoveryPhraseWritten] = useState(false)
  const [isRecoveryPhraseValidated, setRecoveryPhraseValidated] = useState(false)
  const [isCondition1, setCondition1] = useState(false)
  const [isCondition2, setCondition2] = useState(false)
  const [step, setStep] = useState<WalletCreateSteps>('DEFINE')

  const recoveryPhrase = [
    'vengeful',
    'legs',
    'cute',
    'rifle',
    'bite',
    'spell',
    'ambiguous',
    'impossible',
    'fabulous',
    'observe',
    'offer',
    'baseball',
  ]
  const privateKey =
    '75cc353f301d9f23a3a3c936d9b306af8fbb59f43e95244fe84ff3f301d9f23a3a3c936d9b306af8fbb59f43e95244fe83f301d9f2375cc353f301d9f23a3a3c936d9b306af8fbb59f43e95244fe84ff3f301d9f23a3a3c936d9b306af8fbb5'

  switch (step) {
    case 'DEFINE':
      return (
        <Dialog
          title="Create wallet"
          prevButtonAction={cancel}
          nextButtonAction={(): void => setStep('SECURITY')}
        >
          <DialogInput label="Wallet name" />
          <DialogSwitch
            key="use-password-switch"
            label="Spending password"
            description="Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna"
            checked={usePassword}
            onChange={setUsePassword}
          />
          {usePassword && <DialogPassword />}
        </Dialog>
      )
    case 'SECURITY':
      return (
        <Dialog
          title="Security"
          prevButtonLabel="Back"
          prevButtonAction={(): void => setStep('DEFINE')}
          nextButtonAction={(): void => setStep('DISPLAY_RECOVERY')}
        >
          <DialogMessage
            label="Recovery Phrase"
            description="Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna"
          />
          <DialogSwitch
            key="private-key-switch"
            label="Private key"
            description="Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna"
            checked={usePrivateKey}
            onChange={setUsePrivateKey}
          />
          {usePrivateKey && <DialogPrivateKey privateKey={privateKey} />}
        </Dialog>
      )
    case 'DISPLAY_RECOVERY':
      return (
        <Dialog
          title="Recovery Phrase"
          prevButtonLabel="Back"
          prevButtonAction={(): void => setStep('SECURITY')}
          nextButtonAction={(): void => setStep('VERIFY_RECOVERY')}
          nextButtonDisabled={!isRecoveryPhraseWritten}
        >
          <DialogMessage description="Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna" />
          <DialogApproval
            description="Yes, I have written it down."
            checked={isRecoveryPhraseWritten}
            onChange={setRecoveryPhraseWritten}
          />
        </Dialog>
      )
    case 'VERIFY_RECOVERY':
      return (
        <Dialog
          title="Recovery Phrase"
          prevButtonLabel="Back"
          prevButtonAction={(): void => setStep('DISPLAY_RECOVERY')}
          nextButtonLabel="Finish"
          nextButtonAction={(): void => alert('finihed')}
          nextButtonDisabled={!isCondition1 || !isCondition2 || !isRecoveryPhraseValidated}
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
}
