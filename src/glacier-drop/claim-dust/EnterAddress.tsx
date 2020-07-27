import React, {useState} from 'react'
import {validateEthAddress, toAntValidator, ValidationResult} from '../../common/util'
import {wrapWithModal, ModalLocker, ModalOnCancel} from '../../common/LunaModal'
import {Dialog} from '../../common/Dialog'
import {DialogInput} from '../../common/dialog/DialogInput'
import {DisplayChain} from '../../pob/chains'
import {GlacierState, BalanceWithProof} from '../glacier-state'
import {ETC_CHAIN} from '../glacier-config'
import {LINKS} from '../../external-link-config'
import {useTranslation} from '../../settings-state'

interface EnterAddressProps extends ModalOnCancel {
  onNext: (address: string, balanceWithProof: BalanceWithProof) => void
  chain?: DisplayChain
}

const _EnterAddress = ({onNext, onCancel, chain = ETC_CHAIN}: EnterAddressProps): JSX.Element => {
  const modalLocker = ModalLocker.useContainer()
  const {t} = useTranslation()
  const {getEtcSnapshotBalanceWithProof, claimedAddresses} = GlacierState.useContainer()

  const [address, setAddress] = useState<string>('')

  const isAlreadyClaimed = (address?: string): ValidationResult =>
    address && claimedAddresses.includes(address)
      ? {tKey: ['glacierDrop', 'error', 'alreadyClaimed']}
      : 'OK'

  return (
    <Dialog
      title="Claim Dust"
      rightButtonProps={{
        children: 'Proceed',
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
          rules: [toAntValidator(t, isAlreadyClaimed), toAntValidator(t, validateEthAddress)],
        }}
        autoFocus
      />
    </Dialog>
  )
}

export const EnterAddress = wrapWithModal(_EnterAddress, 'EnterAddress')
