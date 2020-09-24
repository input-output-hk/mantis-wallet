import React, {useState} from 'react'
import _ from 'lodash'
import {RouterState} from '../router-state'
import {WalletState} from '../common/wallet-state'
import {DialogError} from '../common/dialog/DialogError'
import {WalletCreateDefineStep} from './create/WalletCreateDefineStep'
import {WalletCreateSecurityStep} from './create/WalletCreateSecurityStep'
import {WalletCreateDisplayRecoveryStep} from './create/WalletCreateDisplayRecoveryStep'
import {WalletCreateVerifyRecoveryStep} from './create/WalletCreateVerifyRecoveryStep'
import {useTranslation} from '../settings-state'
import {createNewAccount} from '../common/mnemonic'

interface WalletCreateProps {
  cancel: () => void
  finish: () => void
}

type WalletCreateSteps = 'DEFINE' | 'SECURITY' | 'DISPLAY_RECOVERY' | 'VERIFY_RECOVERY'

export const WalletCreate = ({cancel, finish}: WalletCreateProps): JSX.Element => {
  const {t, translateError} = useTranslation()
  const routerState = RouterState.useContainer()
  const walletState = WalletState.useContainer()
  const [step, setStep] = useState<WalletCreateSteps>('DEFINE')

  const [walletCreateError, setWalletCreateError] = useState('')
  const createErrors = walletCreateError ? <DialogError>{walletCreateError}</DialogError> : null

  const [walletName, setWalletName] = useState('')
  const [password, setPassword] = useState('')
  const [privateKey, setPrivateKey] = useState('')
  const [seedPhrase, setSeedPhrase] = useState<string[]>([])

  const cancelCreate = async (): Promise<void> => {
    cancel()
    routerState.setLocked(false)
  }

  const finishCreate = async (): Promise<void> => {
    routerState.setLocked(false)
    if (walletState.walletStatus !== 'NO_WALLET') {
      return setWalletCreateError(t(['wallet', 'error', 'walletAlreadyExists']))
    }
    walletState.addAccount(walletName, privateKey, password)
    finish()
  }

  switch (step) {
    case 'DEFINE':
      return (
        <WalletCreateDefineStep
          cancel={cancel}
          next={async (walletName, password): Promise<void> => {
            if (walletState.walletStatus !== 'NO_WALLET') {
              return setWalletCreateError(t(['wallet', 'error', 'walletAlreadyExists']))
            }
            routerState.setLocked(true)
            setWalletCreateError('')
            try {
              const {
                privateKey: newPrivateKey,
                seedPhrase: newSeedPhrase,
              } = await createNewAccount()
              setWalletName(walletName)
              setPassword(password)
              setPrivateKey(newPrivateKey)
              setSeedPhrase(newSeedPhrase)
              setStep('SECURITY')
            } catch (e) {
              routerState.setLocked(false)
              setWalletCreateError(translateError(e))
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
          privateKey={privateKey}
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
          shuffledSeedPhrase={_.shuffle(seedPhrase)}
        />
      )
  }
}
