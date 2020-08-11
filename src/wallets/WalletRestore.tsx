import React, {useState} from 'react'
import {NoWalletState} from '../common/wallet-state'
import {PropsWithWalletState, withStatusGuard} from '../common/wallet-status-guard'
import {Dialog} from '../common/Dialog'
import {DialogPassword} from '../common/dialog/DialogPassword'
import {DialogInput} from '../common/dialog/DialogInput'
import {DialogSecrets, RecoveryMethod} from '../common/dialog/DialogSecrets'
import {useTranslation} from '../settings-state'
import {createTErrorRenderer} from '../common/i18n'

interface WalletRestoreProps {
  cancel: () => void
  finish: () => void
}

const _WalletRestore = ({
  cancel,
  finish,
  walletState,
}: PropsWithWalletState<WalletRestoreProps, NoWalletState>): JSX.Element => {
  const {t} = useTranslation()
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
      title={t(['wallet', 'title', 'restoreWallet'])}
      leftButtonProps={{onClick: cancel}}
      rightButtonProps={{
        onClick: async (): Promise<void> => {
          const isRestored = await restore()
          if (!isRestored) {
            throw createTErrorRenderer(['wallet', 'error', 'couldNotRestoreWallet'])
          }
          finish()
        },
      }}
    >
      <DialogInput
        autoFocus
        label={t(['wallet', 'label', 'walletName'])}
        id="wallet-name"
        onChange={(e): void => setWalletName(e.target.value)}
        formItem={{
          name: 'wallet-name',
          rules: [{required: true, message: t(['wallet', 'error', 'walletNameShouldNotBeEmpty'])}],
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
