import React, {useState} from 'react'
import {WalletPathChooser} from './WalletPathChooser'
import './WalletSetup.scss'
import {WalletCreate} from './WalletCreate'
import {WalletRestore} from './WalletRestore'

type StepType = 'PATH_CHOOSER' | 'CREATE' | 'RESTORE'

const getContent = (
  step: StepType,
  setStep: React.Dispatch<React.SetStateAction<StepType>>,
): JSX.Element => {
  switch (step) {
    case 'PATH_CHOOSER':
      return (
        <WalletPathChooser
          goToCreate={(): void => setStep('CREATE')}
          goToRestore={(): void => setStep('RESTORE')}
        />
      )
    case 'CREATE':
      return <WalletCreate cancel={(): void => setStep('PATH_CHOOSER')} />
    case 'RESTORE':
      return <WalletRestore cancel={(): void => setStep('PATH_CHOOSER')} />
  }
}

export const WalletSetup = (): JSX.Element => {
  const [step, setStep] = useState<StepType>('PATH_CHOOSER')

  return (
    <div className="WalletSetup">
      <div className="title">Wallet Setup</div>
      <div className="content">{getContent(step, setStep)}</div>
    </div>
  )
}
