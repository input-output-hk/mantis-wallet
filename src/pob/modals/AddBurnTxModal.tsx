import React, {useState, FunctionComponent} from 'react'
import _ from 'lodash'
import {ModalLocker, wrapWithModal, ModalOnCancel} from '../../common/LunaModal'
import {Dialog} from '../../common/Dialog'
import {DialogDropdown} from '../../common/dialog/DialogDropdown'
import {DialogInput} from '../../common/dialog/DialogInput'
import {BurnAddressInfo, Prover} from '../pob-state'
import {POB_CHAINS} from '../pob-chains'
import {ShortNumber} from '../../common/ShortNumber'
import {createTErrorRenderer} from '../../common/i18n'
import {useTranslation} from '../../settings-state'

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
  const {t} = useTranslation()
  const [burnAddress, setBurnAddress] = useState(_.keys(burnAddresses)[0])
  const [burnTx, setBurnTx] = useState('')
  const [prover, setProver] = useState(provers[0])
  const modalLocker = ModalLocker.useContainer()

  return (
    <Dialog
      title={t(['proofOfBurn', 'title', 'enterBurnTransactionManually'])}
      leftButtonProps={{
        onClick: onCancel,
        disabled: modalLocker.isLocked,
      }}
      rightButtonProps={{
        children: t(['proofOfBurn', 'button', 'processBurn']),
        disabled: !burnAddresses[burnAddress],
        onClick: async (): Promise<void> => {
          if (prover) {
            await onAddTx(prover, burnTx, burnAddress)
          } else {
            throw createTErrorRenderer(['proofOfBurn', 'error', 'noProverWasSelected'])
          }
        },
      }}
      onSetLoading={modalLocker.setLocked}
    >
      <DialogInput
        autoFocus
        label={t(['proofOfBurn', 'label', 'burnTransactionId'])}
        value={burnTx}
        onChange={(e): void => setBurnTx(e.target.value)}
        formItem={{
          name: 'burn-tx-id',
          rules: [{required: true, message: t(['proofOfBurn', 'error', 'burnTxMustBeSet'])}],
        }}
      />
      <DialogDropdown
        label={t(['proofOfBurn', 'label', 'prover'])}
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
        label={t(['proofOfBurn', 'label', 'burnAddress'])}
        options={_.toPairs(burnAddresses).map(([burnAddress, {chainId, reward}]) => ({
          key: burnAddress,
          label: (
            <>
              ({t(['proofOfBurn', 'label', 'proverRewardShort'])}:{' '}
              <ShortNumber big={reward} unit={POB_CHAINS[chainId].unitType} /> M-
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
