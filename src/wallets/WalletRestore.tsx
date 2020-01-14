import React, {useState} from 'react'
import {Dialog} from '../common/Dialog'
import {DialogPassword} from '../common/dialog/DialogPassword'
import {DialogSwitch} from '../common/dialog/DialogSwitch'
import {DialogInput} from '../common/dialog/DialogInput'
import {DialogTabbedInput} from '../common/dialog/DialogTabbedInput'

interface WalletRestoreProps {
  cancel: () => void
}

export const WalletRestore: React.FunctionComponent<WalletRestoreProps> = ({
  cancel,
}: WalletRestoreProps) => {
  const [usePassword, setUsePassword] = useState(false)

  return (
    <Dialog
      title="Restore wallet"
      prevButtonAction={cancel}
      nextButtonAction={(): void => alert('restored')}
    >
      <DialogInput label="Wallet name" />
      <DialogTabbedInput labels={['Private key', 'Recovery phrase']} />
      <DialogSwitch
        key="use-password-switch"
        label="Spending password"
        description="Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna"
        checked={usePassword}
        onChange={setUsePassword}
      />
      {usePassword && <DialogPassword />}
    </Dialog>
  )
}
