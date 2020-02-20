import React, {useState} from 'react'
import {ModalProps} from 'antd/lib/modal'
import {LunaModal} from '../../common/LunaModal'
import {Dialog} from '../../common/Dialog'
import {DialogDropdown} from '../../common/dialog/DialogDropdown'
import {DialogInput} from '../../common/dialog/DialogInput'
import {DialogSwitch} from '../../common/dialog/DialogSwitch'
import {DialogError} from '../../common/dialog/DialogError'
import {ProverConfig} from '../../config/type'
import {CHAINS, Chain} from '../../common/chains'

interface CreateBurnModalProps {
  provers: ProverConfig[]
  transparentAddresses: string[]
  errorMessage?: string
  onCreateBurn: (
    proverAddress: string,
    address: string,
    chain: Chain,
    reward: number,
    autoConversion: boolean,
  ) => Promise<void>
}

const CHAINS_IN_USE = [CHAINS.BTC_TESTNET, CHAINS.ETH_TESTNET]

export const CreateBurnModal: React.FunctionComponent<CreateBurnModalProps & ModalProps> = ({
  provers,
  transparentAddresses,
  onCreateBurn,
  errorMessage,
  ...props
}: CreateBurnModalProps & ModalProps) => {
  const [proverAddress, setProverAddress] = useState<string>(provers[0].address)
  const [transparentAddress, setTransparentAddress] = useState(transparentAddresses[0])
  const [chainId, setChainId] = useState(CHAINS.BTC_TESTNET.id)
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
              CHAINS[chainId],
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
        <DialogDropdown
          label="Transparent Address"
          options={CHAINS_IN_USE.map(({id, name}) => ({
            key: id,
            label: name,
          }))}
          onChange={setChainId}
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
