import React, {useState} from 'react'
import {NoWalletState} from '../common/wallet-state'
import {PropsWithWalletState, withStatusGuard} from '../common/wallet-status-guard'
import {Dialog} from '../common/Dialog'
import {DialogPassword} from '../common/dialog/DialogPassword'
import {DialogInput} from '../common/dialog/DialogInput'
import {DialogSecrets, RecoveryMethod} from '../common/dialog/DialogSecrets'

interface WalletRestoreProps {
  cancel: () => void
  finish: () => void
}

const _WalletRestore = ({
  cancel,
  finish,
  walletState,
}: PropsWithWalletState<WalletRestoreProps, NoWalletState>): JSX.Element => {
  const [, setWalletName] = useState('')
  const [spendingKey, setSpendingKey] = useState('')
  const [seedPhraseString, setSeedPhrase] = useState('')
  const [passphrase, setPassphrase] = useState('')
  const [recoveryMethod, setRecoveryMethod] = useState<RecoveryMethod>('spendingKey')

  const restore = async (): Promise<boolean> => {
    switch (recoveryMethod) {
      case 'spendingKey':
        return walletState.restoreFromSpendingKey({passphrase, spendingKey})
      case 'seedPhrase':
        const seedPhrase = seedPhraseString.split(' ')
        return walletState.restoreFromSeedPhrase({passphrase, seedPhrase})
    }
  }

  return (
    <Dialog
      title="Restore wallet"
      leftButtonProps={{onClick: cancel}}
      rightButtonProps={{
        onClick: async (): Promise<void> => {
          const isRestored = await restore()
          if (!isRestored) {
            throw Error("Couldn't restore wallet with the provided information")
          }
          finish()
        },
      }}
    >
      <DialogInput
        autoFocus
        label="Wallet name"
        id="wallet-name"
        onChange={(e): void => setWalletName(e.target.value)}
        formItem={{
          name: 'wallet-name',
          rules: [{required: true, message: "Name shouldn't be empty"}],
        }}
      />
      <DialogSecrets
        onMethodChange={setRecoveryMethod}
        onSpendingKeyChange={setSpendingKey}
        onSeedPhraseChange={setSeedPhrase}
      />
      <DialogPassword onChange={setPassphrase} />
    </Dialog>
  )
}

export const WalletRestore = withStatusGuard(_WalletRestore, 'NO_WALLET')
