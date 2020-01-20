import React, {useState} from 'react'
import {Dialog} from '../../common/Dialog'
import {DialogMessage} from '../../common/dialog/DialogMessage'
import {DialogSwitch} from '../../common/dialog/DialogSwitch'
import {DialogPrivateKey} from '../../common/dialog/DialogPrivateKey'

interface WalletCreateSecurityStepProps {
  back: () => void
  next: () => void
  spendingKey: string
}

export const WalletCreateSecurityStep: React.FunctionComponent<WalletCreateSecurityStepProps> = ({
  back,
  next,
  spendingKey,
}: WalletCreateSecurityStepProps) => {
  const [useSpendingKey, setUseSpendingKey] = useState(false)

  return (
    <Dialog
      title="Security"
      prevButtonProps={{onClick: back, children: 'Back'}}
      nextButtonProps={{onClick: next}}
    >
      <DialogMessage
        label="Recovery Phrase"
        description="Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna"
      />
      <DialogSwitch
        key="private-key-switch"
        label="Private key"
        description="Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna"
        checked={useSpendingKey}
        onChange={setUseSpendingKey}
      />
      {useSpendingKey && <DialogPrivateKey privateKey={spendingKey} enableDownload />}
    </Dialog>
  )
}
