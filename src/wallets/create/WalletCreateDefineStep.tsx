import React, {useState} from 'react'
import {Dialog} from '../../common/Dialog'
import {DialogInput} from '../../common/dialog/DialogInput'
import {DialogSwitch} from '../../common/dialog/DialogSwitch'
import {DialogPassword} from '../../common/dialog/DialogPassword'

interface WalletCreateDefineStepProps {
  cancel: () => void
  next: (walletName: string, passphrase: string) => Promise<void>
  errors?: React.ReactNode
}

export const WalletCreateDefineStep: React.FunctionComponent<WalletCreateDefineStepProps> = ({
  cancel,
  next,
  errors,
}: WalletCreateDefineStepProps) => {
  const [walletName, setWalletName] = useState('')
  const [usePassphrase, setUsePassphrase] = useState(false)
  const [passphrase, setPassphrase] = useState('')
  const [isPassphraseValid, setPassphraseValid] = useState(true)

  return (
    <Dialog
      title="Create wallet"
      leftButtonProps={{onClick: cancel}}
      rightButtonProps={{
        onClick: async (): Promise<void> => next(walletName, usePassphrase ? passphrase : ''),
        disabled: walletName.length === 0 || (usePassphrase && !isPassphraseValid),
      }}
      footer={errors}
    >
      <DialogInput
        label="Wallet name"
        id="wallet-name"
        onChange={(e): void => setWalletName(e.target.value)}
        errorMessage={walletName.length === 0 ? "Name shouldn't be empty" : ''}
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
