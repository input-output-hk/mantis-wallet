import React, {useState} from 'react'
import _ from 'lodash'
import {ModalProps} from 'antd/lib/modal'
import {LunaModal} from '../../common/LunaModal'
import {Dialog} from '../../common/Dialog'
import {DialogDropdown} from '../../common/dialog/DialogDropdown'
import {DialogInput} from '../../common/dialog/DialogInput'
import {ProverConfig} from '../../config/type'
import {BurnAddressInfo} from '../pob-state'
import {CHAINS} from '../chains'
import {useIsMounted} from '../../common/hook-utils'
import {DialogError} from '../../common/dialog/DialogError'
import {ShortNumber} from '../../common/ShortNumber'

interface AddBurnTxModalProps {
  provers: ProverConfig[]
  burnAddresses: Record<string, BurnAddressInfo>
  onAddTx: (
    proverAddress: ProverConfig,
    burnTx: string,
    bunrAddressInfo: BurnAddressInfo,
  ) => Promise<void>
}

export const AddBurnTxModal: React.FunctionComponent<AddBurnTxModalProps & ModalProps> = ({
  provers,
  burnAddresses,
  onAddTx,
  ...props
}: AddBurnTxModalProps & ModalProps) => {
  const [burnAddress, setBurnAddress] = useState(_.keys(burnAddresses)[0])
  const [burnTx, setBurnTx] = useState('')
  const [prover, setProver] = useState(provers[0])

  const txErrorMessage = !burnTx ? 'Burn transaction must be set' : ''

  const [inProgress, setInProgress] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const errors = errorMessage && <DialogError>{errorMessage}</DialogError>

  const mounted = useIsMounted()

  return (
    <LunaModal destroyOnClose {...props}>
      <Dialog
        title="Enter burn transaction manually"
        leftButtonProps={{
          onClick: props.onCancel,
        }}
        rightButtonProps={{
          children: 'Process Burn',
          loading: inProgress,
          disabled: !!txErrorMessage,
          onClick: async (): Promise<void> => {
            if (mounted.current) setInProgress(true)
            try {
              if (prover) {
                await onAddTx(prover, burnTx, burnAddresses[burnAddress])
              } else {
                setErrorMessage('No prover was selected.')
              }
            } catch (e) {
              if (mounted.current) setErrorMessage(e.message)
            } finally {
              if (mounted.current) setInProgress(false)
            }
          },
        }}
        footer={errors}
      >
        <DialogInput
          label="Burn Transaction Id"
          value={burnTx}
          onChange={(e): void => setBurnTx(e.target.value)}
          errorMessage={txErrorMessage}
        />
        <DialogDropdown
          label="Prover"
          type="small"
          options={provers.map((prover) => ({
            key: prover.address,
            label: `${prover.name} (${prover.address})`,
          }))}
          onChange={(proverAddress) => {
            const prover = provers.find(({address}) => proverAddress === address)
            if (prover) setProver(prover)
          }}
        />
        <DialogDropdown
          label="Burn Address"
          type="small"
          options={_.toPairs(burnAddresses).map(([burnAddress, {chainId, reward}]) => ({
            key: burnAddress,
            label: (
              <>
                (Reward: <ShortNumber big={reward} unit={CHAINS[chainId].unitType} /> M-
                {CHAINS[chainId].symbol}) {burnAddress}
              </>
            ),
          }))}
          onChange={setBurnAddress}
        />
      </Dialog>
    </LunaModal>
  )
}
