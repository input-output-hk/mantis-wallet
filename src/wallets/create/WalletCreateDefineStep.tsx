import React, {useState, FunctionComponent} from 'react'
import {Dialog} from '../../common/Dialog'
import {DialogInput} from '../../common/dialog/DialogInput'
import {DialogPassword} from '../../common/dialog/DialogPassword'
import {useTranslation} from '../../settings-state'

interface WalletCreateDefineStepProps {
  cancel: () => void
  next: (walletName: string, password: string) => Promise<void>
  errors?: React.ReactNode
}

export const WalletCreateDefineStep: FunctionComponent<WalletCreateDefineStepProps> = ({
  cancel,
  next,
  errors,
}: WalletCreateDefineStepProps) => {
  const {t} = useTranslation()
  const [walletName, setWalletName] = useState('')
  const [password, setPassword] = useState('')

  return (
    <Dialog
      title={t(['wallet', 'title', 'walletCreationFirstStep'])}
      leftButtonProps={{onClick: cancel}}
      rightButtonProps={{
        onClick: async (): Promise<void> => next(walletName, password),
      }}
      footer={errors}
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
      <DialogPassword onChange={setPassword} />
    </Dialog>
  )
}
