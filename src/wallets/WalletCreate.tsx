import React, {useState} from 'react'
import _ from 'lodash/fp'
import {WalletDialog} from './WalletDialog'
import {WalletDialogInput} from './dialog/WalletDialogInput'
import {WalletDialogSwitch} from './dialog/WalletDialogSwitch'
import {WalletDialogPassword} from './dialog/WalletDialogPassword'
import {WalletDialogMessage} from './dialog/WalletDialogMessage'
import {WalletDialogPrivateKey} from './dialog/WalletDialogPrivateKey'
import {WalletDialogApproval} from './dialog/WalletDialogApproval'
import {WalletDialogRecoveryPhrase} from './dialog/WalletDialogRecoveryPhrase'

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
        <WalletDialog
          title="Create wallet"
          prevButtonAction={cancel}
          nextButtonAction={(): void => setStep('SECURITY')}
        >
          <WalletDialogInput label="Wallet name" />
          <WalletDialogSwitch
            key="use-password-switch"
            label="Spending password"
            description="Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna"
            checked={usePassword}
            onChange={setUsePassword}
          />
          {usePassword && <WalletDialogPassword />}
        </WalletDialog>
      )
    case 'SECURITY':
      return (
        <WalletDialog
          title="Security"
          prevButtonLabel="Back"
          prevButtonAction={(): void => setStep('DEFINE')}
          nextButtonAction={(): void => setStep('DISPLAY_RECOVERY')}
        >
          <WalletDialogMessage
            label="Recovery Phrase"
            description="Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna"
          />
          <WalletDialogSwitch
            key="private-key-switch"
            label="Private key"
            description="Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna"
            checked={usePrivateKey}
            onChange={setUsePrivateKey}
          />
          {usePrivateKey && <WalletDialogPrivateKey privateKey={privateKey} />}
        </WalletDialog>
      )
    case 'DISPLAY_RECOVERY':
      return (
        <WalletDialog
          title="Recovery Phrase"
          prevButtonLabel="Back"
          prevButtonAction={(): void => setStep('SECURITY')}
          nextButtonAction={(): void => setStep('VERIFY_RECOVERY')}
          nextButtonDisabled={!isRecoveryPhraseWritten}
        >
          <WalletDialogMessage description="Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna" />
          <WalletDialogApproval
            description="Yes, I have written it down."
            checked={isRecoveryPhraseWritten}
            onChange={setRecoveryPhraseWritten}
          />
        </WalletDialog>
      )
    case 'VERIFY_RECOVERY':
      return (
        <WalletDialog
          title="Recovery Phrase"
          prevButtonLabel="Back"
          prevButtonAction={(): void => setStep('DISPLAY_RECOVERY')}
          nextButtonLabel="Finish"
          nextButtonAction={(): void => alert('finihed')}
          nextButtonDisabled={!isCondition1 || !isCondition2 || !isRecoveryPhraseValidated}
        >
          <WalletDialogRecoveryPhrase
            recoveryPhraseValidation={(enteredPhrase): boolean =>
              _.isEqual(enteredPhrase, recoveryPhrase)
            }
            setRecoveryPhraseValidated={setRecoveryPhraseValidated}
            recoveryPhraseShuffled={_.shuffle(recoveryPhrase)}
          />
          <WalletDialogApproval
            description="Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna"
            checked={isCondition1}
            onChange={setCondition1}
          />
          <WalletDialogApproval
            description="Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna"
            checked={isCondition2}
            onChange={setCondition2}
          />
        </WalletDialog>
      )
  }
}
