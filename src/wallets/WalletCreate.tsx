import React, {useState} from 'react'
import {WalletCreateDefineStep} from './create/WalletCreateDefineStep'
import {WalletCreateSecurityStep} from './create/WalletCreateSecurityStep'
import {WalletCreateDisplayRecoveryStep} from './create/WalletCreateDisplayRecoveryStep'
import {WalletCreateVerifyRecoveryStep} from './create/WalletCreateVerifyRecoveryStep'

interface WalletCreateProps {
  cancel: () => void
}

type WalletCreateSteps = 'DEFINE' | 'SECURITY' | 'DISPLAY_RECOVERY' | 'VERIFY_RECOVERY'

export const WalletCreate: React.FunctionComponent<WalletCreateProps> = ({
  cancel,
}: WalletCreateProps) => {
  const [step, setStep] = useState<WalletCreateSteps>('DEFINE')

  const spendingKey =
    '75cc353f301d9f23a3a3c936d9b306af8fbb59f43e95244fe84ff3f301d9f23a3a3c936d9b306af8fbb59f43e95244fe83f301d9f2375cc353f301d9f23a3a3c936d9b306af8fbb59f43e95244fe84ff3f301d9f23a3a3c936d9b306af8fbb5'
  const seedPhrase = [
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

  switch (step) {
    case 'DEFINE':
      return <WalletCreateDefineStep cancel={cancel} next={(): void => setStep('SECURITY')} />
    case 'SECURITY':
      return (
        <WalletCreateSecurityStep
          back={(): void => setStep('DEFINE')}
          next={(): void => setStep('DISPLAY_RECOVERY')}
          spendingKey={spendingKey}
        />
      )
    case 'DISPLAY_RECOVERY':
      return (
        <WalletCreateDisplayRecoveryStep
          back={(): void => setStep('SECURITY')}
          next={(): void => setStep('VERIFY_RECOVERY')}
          seedPhrase={seedPhrase}
        />
      )
    case 'VERIFY_RECOVERY':
      return (
        <WalletCreateVerifyRecoveryStep
          back={(): void => setStep('SECURITY')}
          finish={(): void => console.log('finished')}
          seedPhrase={seedPhrase}
        />
      )
  }
}
