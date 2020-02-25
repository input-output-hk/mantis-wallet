import React, {useState} from 'react'
import {ModalProps} from 'antd/lib/modal'
import {LunaModal} from '../../common/LunaModal'
import {Dialog} from '../../common/Dialog'
import {DialogDropdown} from '../../common/dialog/DialogDropdown'
import {DialogInput} from '../../common/dialog/DialogInput'
import {DialogSwitch} from '../../common/dialog/DialogSwitch'
import {DialogError} from '../../common/dialog/DialogError'
import {ProverConfig} from '../../config/type'
import {CHAINS, Chain, ChainId} from '../chains'
import {message} from 'antd'

interface CreateBurnModalProps {
  provers: ProverConfig[]
  transparentAddresses: string[]
  errorMessage?: string
  onCreateBurn: (
    prover: ProverConfig,
    address: string,
    chain: Chain,
    reward: number,
    autoConversion: boolean,
  ) => Promise<void>
}

const CHAINS_IN_USE: ChainId[] = ['BTC_TESTNET', 'ETH_TESTNET']

export const CreateBurnModal: React.FunctionComponent<CreateBurnModalProps & ModalProps> = ({
  provers,
  transparentAddresses,
  onCreateBurn,
  errorMessage,
  ...props
}: CreateBurnModalProps & ModalProps) => {
  const [proverAddress, setProverAddress] = useState<string>(provers[0].address)
  const [transparentAddress, setTransparentAddress] = useState(transparentAddresses[0])
  const [chainId, setChainId] = useState(CHAINS_IN_USE[0])
  const [reward, setReward] = useState('1')
  const [autoConversion, setAutoConversion] = useState(true)

  const prover = provers.find(({address}) => proverAddress === address)
  const chain = CHAINS.find(({id}) => id === chainId)
  const proverErrorMessage = prover ? '' : 'You must select a prover'
  const errorMessageToShow = errorMessage || proverErrorMessage

  return (
    <LunaModal {...props}>
      <Dialog
        title="Create Burn Address"
        prevButtonProps={{
          onClick: props.onCancel,
        }}
        nextButtonProps={{
          disabled: !!errorMessageToShow,
          onClick: async () => {
            if (prover && chain) {
              try {
                await onCreateBurn(
                  prover,
                  transparentAddress,
                  chain,
                  parseInt(reward),
                  autoConversion,
                )
              } catch (e) {
                message.error(e.message)
              }
            }
          },
        }}
        footer={errorMessageToShow && <DialogError>{errorMessageToShow}</DialogError>}
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
          label="Chain"
          options={CHAINS.filter(({id}) => CHAINS_IN_USE.includes(id)).map(({id, name}) => ({
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
