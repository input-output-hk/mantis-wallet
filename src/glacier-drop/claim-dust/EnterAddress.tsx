import React, {useState} from 'react'
import {validateEthAddress} from '../../common/util'
import {wrapWithModal, ModalLocker, ModalOnCancel} from '../../common/LunaModal'
import {Dialog} from '../../common/Dialog'
import {DialogInput} from '../../common/dialog/DialogInput'
import {DisplayChain} from '../../pob/chains'
import {GlacierState, BalanceWithProof} from '../glacier-state'
import {ETC_CHAIN} from '../glacier-config'

interface EnterAddressProps extends ModalOnCancel {
  onNext: (address: string, balanceWithProof: BalanceWithProof) => void
  chain?: DisplayChain
}

const _EnterAddress = ({onNext, onCancel, chain = ETC_CHAIN}: EnterAddressProps): JSX.Element => {
  const {getEtcSnapshotBalanceWithProof, claimedAddresses} = GlacierState.useContainer()

  const [address, setAddress] = useState<string>('')

  const modalLocker = ModalLocker.useContainer()

  const addressClaimedError = claimedAddresses.includes(address) ? 'Already claimed' : ''
  const addressError = validateEthAddress(address) || addressClaimedError
  const isDisabled = addressError !== ''

  return (
    <Dialog
      title="Claim Dust"
      rightButtonProps={{
        children: 'Proceed',
        type: 'default',
        onClick: async () => {
          const balanceWithProof = await getEtcSnapshotBalanceWithProof(address)
          onNext(address, balanceWithProof)
        },
        disabled: isDisabled,
      }}
      leftButtonProps={{
        onClick: onCancel,
        disabled: modalLocker.isLocked,
      }}
      type="dark"
    >
      <DialogInput
        autoFocus
        label={`${chain.symbol} Public Address`}
        value={address}
        onChange={(e): void => {
          setAddress(e.target.value)
        }}
        errorMessage={addressError}
      />
    </Dialog>
  )
}

export const EnterAddress = wrapWithModal(_EnterAddress, 'EnterAddress')
