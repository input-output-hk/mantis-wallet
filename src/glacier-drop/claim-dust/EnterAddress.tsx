import React, {useState} from 'react'
import {validateEthAddress, toAntValidator} from '../../common/util'
import {wrapWithModal, ModalLocker, ModalOnCancel} from '../../common/LunaModal'
import {Dialog} from '../../common/Dialog'
import {DialogInput} from '../../common/dialog/DialogInput'
import {DisplayChain} from '../../pob/chains'
import {GlacierState, BalanceWithProof} from '../glacier-state'
import {ETC_CHAIN} from '../glacier-config'
import {LINKS} from '../../external-link-config'

interface EnterAddressProps extends ModalOnCancel {
  onNext: (address: string, balanceWithProof: BalanceWithProof) => void
  chain?: DisplayChain
}

const _EnterAddress = ({onNext, onCancel, chain = ETC_CHAIN}: EnterAddressProps): JSX.Element => {
  const modalLocker = ModalLocker.useContainer()
  const {getEtcSnapshotBalanceWithProof, claimedAddresses} = GlacierState.useContainer()

  const [address, setAddress] = useState<string>('')

  const isAlreadyClaimed = (address?: string): string =>
    address && claimedAddresses.includes(address) ? 'Already claimed' : ''

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
      }}
      leftButtonProps={{
        onClick: onCancel,
        disabled: modalLocker.isLocked,
      }}
      type="dark"
      helpURL={LINKS.aboutGlacier}
    >
      <DialogInput
        id="public-address"
        label={`${chain.symbol} Public Address`}
        value={address}
        onChange={(e): void => {
          setAddress(e.target.value)
        }}
        formItem={{
          name: 'public-address',
          rules: [toAntValidator(isAlreadyClaimed), toAntValidator(validateEthAddress)],
        }}
        autoFocus
      />
    </Dialog>
  )
}

export const EnterAddress = wrapWithModal(_EnterAddress, 'EnterAddress')
