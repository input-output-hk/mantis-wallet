import React, {useState} from 'react'
import {Dialog} from '../../common/Dialog'
import {DialogInput} from '../../common/dialog/DialogInput'
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
  const [passphrase, setPassphrase] = useState('')
  const [isPassphraseValid, setPassphraseValid] = useState(false)

  return (
    <Dialog
      title="Create wallet"
      leftButtonProps={{onClick: cancel}}
      rightButtonProps={{
        onClick: async (): Promise<void> => next(walletName, passphrase),
        disabled: walletName.length === 0 || !isPassphraseValid,
      }}
      footer={errors}
    >
      <DialogInput
        autoFocus
        label="Wallet name"
        id="wallet-name"
        onChange={(e): void => setWalletName(e.target.value)}
        errorMessage={walletName.length === 0 ? "Name shouldn't be empty" : ''}
      />
      <DialogPassword onChange={setPassphrase} setValid={setPassphraseValid} />
    </Dialog>
  )
}
