import React, {useState} from 'react'
import {RouterState} from '../router-state'
import {WalletState} from '../common/wallet-state'
import {DialogError} from '../common/dialog/DialogError'
import {WalletCreateDefineStep} from './create/WalletCreateDefineStep'
import {WalletCreateSecurityStep} from './create/WalletCreateSecurityStep'
import {WalletCreateDisplayRecoveryStep} from './create/WalletCreateDisplayRecoveryStep'
import {WalletCreateVerifyRecoveryStep} from './create/WalletCreateVerifyRecoveryStep'

interface WalletCreateProps {
  cancel: () => void
  finish: () => void
}

type WalletCreateSteps = 'DEFINE' | 'SECURITY' | 'DISPLAY_RECOVERY' | 'VERIFY_RECOVERY'

export const WalletCreate = ({cancel, finish}: WalletCreateProps): JSX.Element => {
  const routerState = RouterState.useContainer()
  const walletState = WalletState.useContainer()
  const [step, setStep] = useState<WalletCreateSteps>('DEFINE')

  const [walletCreateError, setWalletCreateError] = useState('')
  const createErrors = walletCreateError ? <DialogError>{walletCreateError}</DialogError> : null

  const [, setWalletName] = useState('')
  const [passphrase, setPassphrase] = useState('')
  const [spendingKey, setSpendingKey] = useState('')
  const [seedPhrase, setSeedPhrase] = useState<string[]>([])

  const cancelCreate = async (): Promise<void> => {
    if (walletState.walletStatus === 'LOCKED') {
      const removed = await walletState.remove({passphrase})
      if (removed) {
        cancel()
        routerState.setLocked(false)
      }
    }
  }

  const finishCreate = (): void => {
    routerState.setLocked(false)
    finish()
  }

  switch (step) {
    case 'DEFINE':
      return (
        <WalletCreateDefineStep
          cancel={cancel}
          next={async (walletName, passphrase): Promise<void> => {
            if (walletState.walletStatus !== 'NO_WALLET') {
              return setWalletCreateError('Wallet already exists')
            }
            routerState.setLocked(true)
            setWalletCreateError('')
            try {
              const {
                spendingKey: newSpendingKey,
                seedPhrase: newSeedPhrase,
              } = await walletState.create({
                passphrase,
              })
              setWalletName(walletName)
              setPassphrase(passphrase)
              setSpendingKey(newSpendingKey)
              setSeedPhrase(newSeedPhrase)
              setStep('SECURITY')
            } catch (e) {
              routerState.setLocked(false)
              setWalletCreateError(e.message)
            }
          }}
          errors={createErrors}
        />
      )
    case 'SECURITY':
      return (
        <WalletCreateSecurityStep
          cancel={cancelCreate}
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
          back={(): void => setStep('DISPLAY_RECOVERY')}
          finish={finishCreate}
          seedPhrase={seedPhrase}
        />
      )
  }
}
