import React, {useState} from 'react'
import {Dialog} from '../common/Dialog'
import {DialogPassword} from '../common/dialog/DialogPassword'
import {DialogSwitch} from '../common/dialog/DialogSwitch'
import {DialogInput} from '../common/dialog/DialogInput'
import {DialogTabs} from '../common/dialog/DialogTabs'
import {DialogError} from '../common/dialog/DialogError'
import {DialogSeedPhrase} from '../common/dialog/DialogSeedPhrase'
import {web3} from '../web3'

enum RecoveryMethod {
  SpendingKey = 'Private key',
  SeedPhrase = 'Recovery Phrase',
}

interface WalletRestoreProps {
  cancel: () => void
  finish: () => void
}

export const WalletRestore: React.FunctionComponent<WalletRestoreProps> = ({
  cancel,
  finish,
}: WalletRestoreProps) => {
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
    switch (recoveryMethod) {
      case RecoveryMethod.SpendingKey:
        return web3.midnight.wallet.restoreFromSpendingKey({passphrase, spendingKey})
      case RecoveryMethod.SeedPhrase:
        const seedPhrase = seedPhraseString.split(' ')
        return web3.midnight.wallet.restoreFromSeedPhrase({passphrase, seedPhrase})
    }
  }

  return (
    <Dialog
      title="Restore wallet"
      prevButtonProps={{onClick: cancel}}
      nextButtonProps={{
        disabled: walletName.length === 0 || (usePassphrase && !isPassphraseValid),
        onClick: async (): Promise<void> => {
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
      <DialogTabs
        tabs={[
          {
            label: RecoveryMethod.SpendingKey,
            content: (
              <DialogInput
                data-testid="private-key"
                onChange={(e): void => setSpendingKey(e.target.value)}
              />
            ),
          },
          {
            label: RecoveryMethod.SeedPhrase,
            content: <DialogSeedPhrase onChange={setSeedPhrase} />,
          },
        ]}
        onTabClick={(key: RecoveryMethod): void => setRecoveryMethod(key)}
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