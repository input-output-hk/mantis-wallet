import React, {useState} from 'react'
import {ModalProps} from 'antd/lib/modal'
import {LunaModal} from '../../common/LunaModal'
import {Dialog} from '../../common/Dialog'
import {DialogDropdown} from '../../common/dialog/DialogDropdown'
import {DialogInput} from '../../common/dialog/DialogInput'
import {DialogSwitch} from '../../common/dialog/DialogSwitch'
import {DialogError} from '../../common/dialog/DialogError'
import {ProverConfig} from '../../config/type'

interface CreateBurnModalProps {
  provers: ProverConfig[]
  transparentAddresses: string[]
  errorMessage?: string
  onCreateBurn: (
    proverAddress: string,
    address: string,
    chainId: number,
    reward: number,
    autoConversion: boolean,
  ) => Promise<void>
}

export const CreateBurnModal: React.FunctionComponent<CreateBurnModalProps & ModalProps> = ({
  provers,
  transparentAddresses,
  onCreateBurn,
  errorMessage,
  ...props
}: CreateBurnModalProps & ModalProps) => {
  const [proverAddress, setProverAddress] = useState<string>(provers[0].address)
  const [transparentAddress, setTransparentAddress] = useState(transparentAddresses[0])
  const [chainId, setChainId] = useState('0')
  const [reward, setReward] = useState('1')
  const [autoConversion, setAutoConversion] = useState(true)

  return (
    <LunaModal {...props}>
      <Dialog
        title="Create Burn Address"
        prevButtonProps={{
          onClick: props.onCancel,
        }}
        nextButtonProps={{
          disabled: !!errorMessage,
          onClick: () =>
            onCreateBurn(
              proverAddress,
              transparentAddress,
              parseInt(chainId),
              parseInt(reward),
              autoConversion,
            ),
        }}
        footer={errorMessage && <DialogError>{errorMessage}</DialogError>}
      >
        <DialogDropdown
          label="Prover"
          options={provers.map((prover) => ({
            key: prover.address,
            label: `${prover.name} (${prover.address})`,
          }))}
          onChange={setProverAddress}
        />
        <DialogDropdown
          label="Transparent Address"
          options={transparentAddresses}
          onChange={setTransparentAddress}
        />
        <DialogInput
          label="Chain ID"
          defaultValue={chainId}
          onChange={(e) => setChainId(e.target.value)}
        />
        <DialogInput
          label="Reward"
          defaultValue={reward}
          onChange={(e) => setReward(e.target.value)}
        />
        <DialogSwitch
          label="Auto Dust Conversion"
          description="Auto Dust Conversion"
          checked={autoConversion}
          onChange={setAutoConversion}
        />
      </Dialog>
    </LunaModal>
  )
}
