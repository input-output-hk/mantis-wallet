import React, {useState, FunctionComponent} from 'react'
import {Dialog} from '../../common/Dialog'
import {DialogInput} from '../../common/dialog/DialogInput'
import {DialogPassword} from '../../common/dialog/DialogPassword'

interface WalletCreateDefineStepProps {
  cancel: () => void
  next: (walletName: string, passphrase: string) => Promise<void>
  errors?: React.ReactNode
}

export const WalletCreateDefineStep: FunctionComponent<WalletCreateDefineStepProps> = ({
  cancel,
  next,
  errors,
}: WalletCreateDefineStepProps) => {
  const [walletName, setWalletName] = useState('')
  const [passphrase, setPassphrase] = useState('')

  return (
    <Dialog
      title="Create wallet"
      leftButtonProps={{onClick: cancel}}
      rightButtonProps={{
        onClick: async (): Promise<void> => next(walletName, passphrase),
      }}
      footer={errors}
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
      <DialogPassword onChange={setPassphrase} />
    </Dialog>
  )
}
