import React, {useState} from 'react'
import {wallet} from '../wallet'
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

export const WalletCreate: React.FunctionComponent<WalletCreateProps> = ({
  cancel,
  finish,
}: WalletCreateProps) => {
  const [step, setStep] = useState<WalletCreateSteps>('DEFINE')

  const [walletCreateError, setWalletCreateError] = useState('')
  const createErrors = walletCreateError ? <DialogError>{walletCreateError}</DialogError> : null

  const [walletName, setWalletName] = useState('')
  const [passphrase, setPassphrase] = useState('')
  const [spendingKey, setSpendingKey] = useState('')
  const [seedPhrase, setSeedPhrase] = useState<string[]>([])

  switch (step) {
    case 'DEFINE':
      return (
        <WalletCreateDefineStep
          cancel={cancel}
          next={async (walletName, passphrase): Promise<void> => {
            setWalletCreateError('')
            try {
              const {spendingKey: newSpendingKey, seedPhrase: newSeedPhrase} = await wallet.create({
                passphrase,
              })
              setWalletName(walletName)
              setPassphrase(passphrase)
              setSpendingKey(newSpendingKey)
              setSeedPhrase(newSeedPhrase)
              setStep('SECURITY')
            } catch (e) {
              setWalletCreateError(e.message)
            }
          }}
          errors={createErrors}
        />
      )
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
          finish={finish}
          seedPhrase={seedPhrase}
        />
      )
  }
}
