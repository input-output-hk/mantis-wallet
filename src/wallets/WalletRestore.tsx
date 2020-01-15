import React, {useState} from 'react'
import {WalletDialog} from './WalletDialog'
import {WalletDialogPassword} from './dialog/WalletDialogPassword'
import {WalletDialogSwitch} from './dialog/WalletDialogSwitch'
import {WalletDialogInput} from './dialog/WalletDialogInput'
import {WalletDialogSecurity} from './dialog/WalletDialogSecurity'

interface WalletRestoreProps {
  cancel: () => void
}

export const WalletRestore: React.FunctionComponent<WalletRestoreProps> = ({
  cancel,
}: WalletRestoreProps) => {
  const [usePassword, setUsePassword] = useState(false)

  return (
    <WalletDialog
      title="Restore wallet"
      prevButtonAction={cancel}
      nextButtonAction={(): void => alert('restored')}
    >
      <WalletDialogInput label="Wallet name" />
      <WalletDialogSecurity labels={['Private key', 'Recovery phrase']} />
      <WalletDialogSwitch
        key="use-password-switch"
        label="Spending password"
        description="Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna"
        checked={usePassword}
        onChange={setUsePassword}
      />
      {usePassword && <WalletDialogPassword />}
    </WalletDialog>
  )
}
