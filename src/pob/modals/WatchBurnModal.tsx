import React, {useState} from 'react'
import {ModalProps} from 'antd/lib/modal'
import {LunaModal} from '../../common/LunaModal'
import {Dialog} from '../../common/Dialog'
import {DialogDropdown} from '../../common/dialog/DialogDropdown'
import {DialogInput} from '../../common/dialog/DialogInput'
import {Prover} from '../pob-state'

interface WatchBurnModalProps {
  provers: Prover[]
  onWatchBurn: (proverAddress: string, bunrAddress: string) => void
}

export const WatchBurnModal: React.FunctionComponent<WatchBurnModalProps & ModalProps> = ({
  provers,
  onWatchBurn,
  ...props
}: WatchBurnModalProps & ModalProps) => {
  const [burnAddress, setBurnAddressToWatch] = useState('')
  const [proverAddress, setProverAddressToUseW] = useState<string>(provers[0].address)

  const errorMessage = burnAddress.length === 0 ? 'Burn address must be set' : ''

  return (
    <LunaModal destroyOnClose {...props}>
      <Dialog
        title="Watch Burn Address"
        leftButtonProps={{
          onClick: props.onCancel,
        }}
        rightButtonProps={{
          disabled: !!errorMessage,
          onClick: () => {
            onWatchBurn(proverAddress, burnAddress)
          },
        }}
      >
        <DialogDropdown
          label="Prover"
          options={provers.map((prover) => ({
            key: prover.address,
            label: `${prover.name} (${prover.address})`,
          }))}
          onChange={setProverAddressToUseW}
        />
        <DialogInput
          label="Burn Address"
          value={burnAddress}
          onChange={(e): void => setBurnAddressToWatch(e.target.value)}
          errorMessage={errorMessage}
        />
      </Dialog>
    </LunaModal>
  )
}
