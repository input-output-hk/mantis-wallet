import React, {useState} from 'react'
import {Redirect} from 'react-router-dom'
import {ROUTES} from '../routes-config'
import {WalletState} from '../common/wallet-state'
import {WalletPathChooser} from './WalletPathChooser'
import {WalletCreate} from './WalletCreate'
import {WalletRestore} from './WalletRestore'
import './WalletSetup.scss'

type StepType = 'PATH_CHOOSER' | 'CREATE' | 'RESTORE' | 'FINISHED'

const getContent = (
  step: StepType,
  setStep: React.Dispatch<React.SetStateAction<StepType>>,
): JSX.Element => {
  const state = WalletState.useContainer()

  const finish = (): void => {
    if (state.walletStatus === 'NO_WALLET') state.reset()
    setStep('FINISHED')
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
      return <WalletCreate cancel={(): void => setStep('PATH_CHOOSER')} finish={finish} />
    case 'RESTORE':
      return <WalletRestore cancel={(): void => setStep('PATH_CHOOSER')} finish={finish} />
    case 'FINISHED':
      return (
        <>
          HELLO
          <Redirect to={ROUTES.WALLETS.path} />
        </>
      )
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
