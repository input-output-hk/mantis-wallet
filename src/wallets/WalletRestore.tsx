import React, {useState} from 'react'
import {Dialog} from '../common/Dialog'
import {DialogPassword} from '../common/dialog/DialogPassword'
import {DialogSwitch} from '../common/dialog/DialogSwitch'
import {DialogInput} from '../common/dialog/DialogInput'
import {DialogError} from '../common/dialog/DialogError'
import {WalletState} from '../common/wallet-state'
import {DialogSecrets, RecoveryMethod} from '../common/dialog/DialogSecrets'

interface WalletRestoreProps {
  cancel: () => void
  finish: () => void
}

export const WalletRestore: React.FunctionComponent<WalletRestoreProps> = ({
  cancel,
  finish,
}: WalletRestoreProps) => {
  const state = WalletState.useContainer()

  const [walletName, setWalletName] = useState('')
  const [spendingKey, setSpendingKey] = useState('')
  const [seedPhraseString, setSeedPhrase] = useState('')
  const [passphrase, setPassphrase] = useState('')
  const [recoveryMethod, setRecoveryMethod] = useState<RecoveryMethod>(RecoveryMethod.SpendingKey)
  const [usePassphrase, setUsePassphrase] = useState(false)
  const [isPassphraseValid, setPassphraseValid] = useState(true)

  const [walletRestoreError, setWalletRestoreError] = useState('')
  const footer = walletRestoreError ? <DialogError>{walletRestoreError}</DialogError> : null

  const restore = async (): Promise<boolean> => {
    if (state.walletStatus !== 'NO_WALLET') {
      return false
    }

    switch (recoveryMethod) {
      case RecoveryMethod.SpendingKey:
        return state.restoreFromSpendingKey({passphrase, spendingKey})
      case RecoveryMethod.SeedPhrase:
        const seedPhrase = seedPhraseString.split(' ')
        return state.restoreFromSeedPhrase({passphrase, seedPhrase})
    }
  }

  return (
    <Dialog
      title="Restore wallet"
      prevButtonProps={{onClick: cancel}}
      nextButtonProps={{
        disabled: walletName.length === 0 || (usePassphrase && !isPassphraseValid),
        onClick: async (): Promise<void> => {
          if (state.walletStatus !== 'NO_WALLET') {
            return setWalletRestoreError('Wallet already exists')
          }

          setWalletRestoreError('')
          try {
            const isRestored = await restore()
            if (isRestored) {
              finish()
            } else {
              setWalletRestoreError("Couldn't restore wallet with the provided information")
            }
          } catch (e) {
            setWalletRestoreError(e.message)
          }
        },
      }}
      footer={footer}
    >
      <DialogInput
        label="Wallet name"
        id="wallet-name"
        onChange={(e): void => setWalletName(e.target.value)}
        errorMessage={walletName.length === 0 ? "Name shouldn't be empty" : ''}
      />
      <DialogSecrets
        onMethodChange={setRecoveryMethod}
        onSpendingKeyChange={setSpendingKey}
        onSeedPhraseChange={setSeedPhrase}
      />
      <DialogSwitch
        key="use-password-switch"
        label="Spending password"
        description="Keep your private keys encrypted by adding a spending password"
        checked={usePassphrase}
        onChange={setUsePassphrase}
      />
      {usePassphrase && <DialogPassword onChange={setPassphrase} setValid={setPassphraseValid} />}
    </Dialog>
  )
}
