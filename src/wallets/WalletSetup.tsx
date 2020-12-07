import React, {useState} from 'react'
import {WalletState} from '../common/wallet-state'
import {Navigate} from '../layout/Router'
import {TermsAndConditionsStep} from './TermsAndConditionsStep'
import {WalletPathChooser} from './WalletPathChooser'
import {WalletCreate} from './WalletCreate'
import {WalletRestore} from './WalletRestore'
import {Trans} from '../common/Trans'
import './WalletSetup.scss'

type StepType = 'PATH_CHOOSER' | 'CREATE' | 'RESTORE' | 'FINISHED'

const getContent = (
  step: StepType,
  setStep: React.Dispatch<React.SetStateAction<StepType>>,
): JSX.Element => {
  const walletState = WalletState.useContainer()
  const [termsAccepted, acceptTerms] = useState<boolean>(false)

  const finish = (): void => {
    if (walletState.walletStatus !== 'INITIAL' && walletState.walletStatus !== 'LOADING') {
      walletState.reset()
    }
    setStep('FINISHED')
  }

  const cancel = (): void => setStep('PATH_CHOOSER')

  if (!termsAccepted) {
    return (
      <TermsAndConditionsStep
        next={() => {
          acceptTerms(true)
          setStep('PATH_CHOOSER')
        }}
      />
    )
  }

  switch (step) {
    case 'PATH_CHOOSER':
      return (
        <WalletPathChooser
          goToCreate={(): void => setStep('CREATE')}
          goToRestore={(): void => setStep('RESTORE')}
        />
      )
    case 'CREATE':
      return <WalletCreate cancel={cancel} finish={finish} />
    case 'RESTORE':
      return <WalletRestore cancel={cancel} finish={finish} />
    case 'FINISHED':
      return <Navigate to="TXNS" />
  }
}

export const WalletSetup = (): JSX.Element => {
  const [step, setStep] = useState<StepType>('PATH_CHOOSER')

  return (
    <div className="WalletSetup">
      <div className="main-title">
        <Trans k={['wallet', 'title', 'walletSetup']} />
      </div>
      <div className="content">{getContent(step, setStep)}</div>
    </div>
  )
}
