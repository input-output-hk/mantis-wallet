import React, {useState} from 'react'
import {Dialog} from '../../common/Dialog'
import {DialogInput} from '../../common/dialog/DialogInput'
import {DialogSwitch} from '../../common/dialog/DialogSwitch'
import {DialogPassword} from '../../common/dialog/DialogPassword'

interface WalletCreateDefineStepProps {
  cancel: () => void
  next: (walletName: string, passphrase: string) => void
}

export const WalletCreateDefineStep: React.FunctionComponent<WalletCreateDefineStepProps> = ({
  cancel,
  next,
}: WalletCreateDefineStepProps) => {
  const [walletName, setWalletName] = useState('')
  const [usePassphrase, setUsePassphrase] = useState(false)
  const [passphrase, setPassphrase] = useState('')
  const [isPassphraseValid, setPassphraseValid] = useState(true)

  return (
    <Dialog
      title="Create wallet"
      prevButtonProps={{onClick: cancel}}
      nextButtonProps={{
        onClick: (): void => next(walletName, usePassphrase ? passphrase : ''),
        disabled: walletName.length === 0 || (usePassphrase && !isPassphraseValid),
      }}
    >
      <DialogInput
        label="Wallet name"
        onChange={(e): void => setWalletName(e.target.value)}
        errorMessage={walletName.length === 0 ? "Name shouldn't be empty" : ''}
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
