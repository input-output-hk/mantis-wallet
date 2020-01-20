import React, {useState} from 'react'
import {Dialog} from '../../common/Dialog'
import {DialogInput} from '../../common/dialog/DialogInput'
import {DialogSwitch} from '../../common/dialog/DialogSwitch'
import {DialogPassword} from '../../common/dialog/DialogPassword'

interface WalletCreateDefineStepProps {
  cancel: () => void
  next: () => void
}

export const WalletCreateDefineStep: React.FunctionComponent<WalletCreateDefineStepProps> = ({
  cancel,
  next,
}: WalletCreateDefineStepProps) => {
  const [usePassword, setUsePassword] = useState(false)

  return (
    <Dialog
      title="Create wallet"
      prevButtonProps={{onClick: cancel}}
      nextButtonProps={{onClick: next}}
    >
      <DialogInput label="Wallet name" />
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
