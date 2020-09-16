import React, {useState} from 'react'
import {NoWalletState} from '../common/wallet-state'
import {PropsWithWalletState, withStatusGuard} from '../common/wallet-status-guard'
import {Dialog} from '../common/Dialog'
import {DialogPassword} from '../common/dialog/DialogPassword'
import {DialogInput} from '../common/dialog/DialogInput'
import {DialogSecrets, RecoveryMethod} from '../common/dialog/DialogSecrets'
import {useTranslation} from '../settings-state'
import {generatePrivateKeyFromSeedPhrase} from '../common/mnemonic'

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
  const [walletName, setWalletName] = useState('')
  const [spendingKey, setSpendingKey] = useState('')
  const [seedPhraseString, setSeedPhrase] = useState('')
  const [password, setPassword] = useState('')
  const [recoveryMethod, setRecoveryMethod] = useState<RecoveryMethod>('spendingKey')

  const restore = async (): Promise<void> => {
    const privateKey =
      recoveryMethod === 'seedPhrase'
        ? await generatePrivateKeyFromSeedPhrase(seedPhraseString)
        : spendingKey
    walletState.addAccount(walletName, privateKey, password)
  }

  return (
    <Dialog
      title={t(['wallet', 'title', 'restoreWallet'])}
      leftButtonProps={{onClick: cancel}}
      rightButtonProps={{
        onClick: async (): Promise<void> => {
          await restore()
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
      <DialogPassword onChange={setPassword} />
    </Dialog>
  )
}

export const WalletRestore = withStatusGuard(_WalletRestore, 'NO_WALLET')
