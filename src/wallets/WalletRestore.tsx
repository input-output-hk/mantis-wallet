import React, {useState} from 'react'
import {Dialog} from '../common/Dialog'
import {DialogPassword} from '../common/dialog/DialogPassword'
import {DialogSwitch} from '../common/dialog/DialogSwitch'
import {DialogInput} from '../common/dialog/DialogInput'
import {DialogTabs} from '../common/dialog/DialogTabs'

interface WalletRestoreProps {
  cancel: () => void
}

export const WalletRestore: React.FunctionComponent<WalletRestoreProps> = ({
  cancel,
}: WalletRestoreProps) => {
  const [usePassword, setUsePassword] = useState(false)

  return (
    <Dialog title="Restore wallet" prevButtonProps={{onClick: cancel}}>
      <DialogInput label="Wallet name" />
      <DialogTabs
        tabs={[
          {
            label: 'Private key',
            content: <DialogInput />,
          },
          {
            label: 'Recovery phrase',
            content: <DialogInput />,
          },
        ]}
      />
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
