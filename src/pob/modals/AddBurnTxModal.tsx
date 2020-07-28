import React, {useState, FunctionComponent} from 'react'
import _ from 'lodash'
import {ModalLocker, wrapWithModal, ModalOnCancel} from '../../common/LunaModal'
import {Dialog} from '../../common/Dialog'
import {DialogDropdown} from '../../common/dialog/DialogDropdown'
import {DialogInput} from '../../common/dialog/DialogInput'
import {BurnAddressInfo, Prover} from '../pob-state'
import {POB_CHAINS} from '../pob-chains'
import {ShortNumber} from '../../common/ShortNumber'

interface AddBurnTxModalProps extends ModalOnCancel {
  provers: Prover[]
  burnAddresses: Record<string, BurnAddressInfo>
  onAddTx: (proverAddress: Prover, burnTx: string, bunrAddress: string) => Promise<void>
}

const AddBurnTxDialog: FunctionComponent<AddBurnTxModalProps> = ({
  provers,
  burnAddresses,
  onAddTx,
  onCancel,
}: AddBurnTxModalProps) => {
  const [burnAddress, setBurnAddress] = useState(_.keys(burnAddresses)[0])
  const [burnTx, setBurnTx] = useState('')
  const [prover, setProver] = useState(provers[0])
  const modalLocker = ModalLocker.useContainer()

  return (
    <Dialog
      title="Enter burn transaction manually"
      leftButtonProps={{
        onClick: onCancel,
        disabled: modalLocker.isLocked,
      }}
      rightButtonProps={{
        children: 'Process Burn',
        disabled: !burnAddresses[burnAddress],
        onClick: async (): Promise<void> => {
          if (prover) {
            await onAddTx(prover, burnTx, burnAddress)
          } else {
            throw Error('No prover was selected.')
          }
        },
      }}
      onSetLoading={modalLocker.setLocked}
    >
      <DialogInput
        autoFocus
        label="Burn Transaction Id"
        value={burnTx}
        onChange={(e): void => setBurnTx(e.target.value)}
        formItem={{
          name: 'burn-tx-id',
          rules: [{required: true, message: 'Burn transaction must be set'}],
        }}
      />
      <DialogDropdown
        label="Prover"
        options={provers.map((prover) => ({
          key: prover.address,
          label: `${prover.name} (${prover.address})`,
        }))}
        onChange={(proverAddress) => {
          const prover = provers.find(({address}) => proverAddress === address)
          if (prover) setProver(prover)
        }}
        noOptionsMessage={['proofOfBurn', 'error', 'noAvailableProvers']}
      />
      <DialogDropdown
        label="Burn Address"
        options={_.toPairs(burnAddresses).map(([burnAddress, {chainId, reward}]) => ({
          key: burnAddress,
          label: (
            <>
              (Reward: <ShortNumber big={reward} unit={POB_CHAINS[chainId].unitType} /> M-
              {POB_CHAINS[chainId].symbol}) {burnAddress}
            </>
          ),
        }))}
        onChange={setBurnAddress}
      />
    </Dialog>
  )
}

export const AddBurnTxModal = wrapWithModal(AddBurnTxDialog)
