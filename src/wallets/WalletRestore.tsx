import React, {useState} from 'react'
import {Dialog} from '../common/Dialog'
import {DialogPassword} from '../common/dialog/DialogPassword'
import {DialogSwitch} from '../common/dialog/DialogSwitch'
import {DialogInput} from '../common/dialog/DialogInput'
import {DialogTabs} from '../common/dialog/DialogTabs'
import {DialogError} from '../common/dialog/DialogError'
import {wallet} from '../wallet'

type RecoveryMethodType = 'Private key' | 'Recovery phrase'

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
  const [recoveryMethod, setRecoveryMethod] = useState<RecoveryMethodType>('Private key')
  const [usePassphrase, setUsePassphrase] = useState(false)
  const [isPassphraseValid, setPassphraseValid] = useState(true)

  const [walletRestoreError, setWalletRestoreError] = useState('')
  const footer = walletRestoreError ? <DialogError>{walletRestoreError}</DialogError> : null

  const restore = async (): Promise<boolean> => {
    switch (recoveryMethod) {
      case 'Private key':
        return wallet.restore({passphrase, spendingKey})
      case 'Recovery phrase':
        const seedPhrase = seedPhraseString.split(' ')
        return wallet.restore({passphrase, seedPhrase})
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
        onChange={(e): void => setWalletName(e.target.value)}
        errorMessage={walletName.length === 0 ? "Name shouldn't be empty" : ''}
      />
      <DialogTabs
        tabs={[
          {
            label: 'Private key',
            content: <DialogInput onChange={(e): void => setSpendingKey(e.target.value)} />,
          },
          {
            label: 'Recovery phrase',
            content: <DialogInput onChange={(e): void => setSeedPhrase(e.target.value)} />,
          },
        ]}
        onTabClick={(key: RecoveryMethodType): void => setRecoveryMethod(key)}
      />
      <DialogSwitch
        key="use-password-switch"
        label="Spending password"
        description="Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna"
        checked={usePassphrase}
        onChange={setUsePassphrase}
      />
      {usePassphrase && <DialogPassword onChange={setPassphrase} setValid={setPassphraseValid} />}
    </Dialog>
  )
}
