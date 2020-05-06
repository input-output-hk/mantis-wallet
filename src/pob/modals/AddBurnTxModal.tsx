import React, {useState} from 'react'
import _ from 'lodash'
import {ModalLocker, wrapWithModal, ModalOnCancel} from '../../common/LunaModal'
import {Dialog} from '../../common/Dialog'
import {DialogDropdown} from '../../common/dialog/DialogDropdown'
import {DialogInput} from '../../common/dialog/DialogInput'
import {BurnAddressInfo, Prover} from '../pob-state'
import {CHAINS} from '../chains'
import {ShortNumber} from '../../common/ShortNumber'

interface AddBurnTxModalProps extends ModalOnCancel {
  provers: Prover[]
  burnAddresses: Record<string, BurnAddressInfo>
  onAddTx: (
    proverAddress: Prover,
    burnTx: string,
    bunrAddressInfo: BurnAddressInfo,
  ) => Promise<void>
}

const AddBurnTxDialog: React.FunctionComponent<AddBurnTxModalProps> = ({
  provers,
  burnAddresses,
  onAddTx,
  onCancel,
}: AddBurnTxModalProps) => {
  const [burnAddress, setBurnAddress] = useState(_.keys(burnAddresses)[0])
  const [burnTx, setBurnTx] = useState('')
  const [prover, setProver] = useState(provers[0])
  const modalLocker = ModalLocker.useContainer()

  const txErrorMessage = !burnTx ? 'Burn transaction must be set' : ''

  return (
    <Dialog
      title="Enter burn transaction manually"
      leftButtonProps={{
        onClick: onCancel,
        disabled: modalLocker.isLocked,
      }}
      rightButtonProps={{
        children: 'Process Burn',
        disabled: !!txErrorMessage || !burnAddresses[burnAddress],
        onClick: async (): Promise<void> => {
          if (prover) {
            await onAddTx(prover, burnTx, burnAddresses[burnAddress])
          } else {
            throw new Error('No prover was selected.')
          }
        },
      }}
      onSetLoading={modalLocker.setLocked}
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
  )
}

export const AddBurnTxModal = wrapWithModal(AddBurnTxDialog)
