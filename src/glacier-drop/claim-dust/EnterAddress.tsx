import React, {useState} from 'react'
import {ModalProps} from 'antd/lib/modal'
import {validateEthAddress} from '../../common/util'
import {LunaModal} from '../../common/LunaModal'
import {Dialog} from '../../common/Dialog'
import {DialogInput} from '../../common/dialog/DialogInput'
import {DisplayChain} from '../../pob/chains'
import {GlacierState, BalanceWithProof} from '../glacier-state'
import {DialogError} from '../../common/dialog/DialogError'
import {ETC_CHAIN} from '../glacier-config'

interface EnterAddressProps {
  onNext: (address: string, balanceWithProof: BalanceWithProof) => void
  onCancel: () => void
  chain?: DisplayChain
}

export const EnterAddress = ({
  onNext,
  onCancel,
  chain = ETC_CHAIN,
  ...props
}: EnterAddressProps & ModalProps): JSX.Element => {
  const {getEtcSnapshotBalanceWithProof, claimedAddresses} = GlacierState.useContainer()

  const [address, setAddress] = useState<string>('')

  const [globalErrorMsg, setGlobalErrorMsg] = useState<string>('')
  const [isLoading, setLoading] = useState<boolean>(false)

  const addressClaimedError = claimedAddresses.includes(address) ? 'Already claimed' : ''
  const addressError = validateEthAddress(address) || addressClaimedError
  const isDisabled = addressError !== '' || isLoading

  const globalErrorElem = globalErrorMsg && <DialogError>{globalErrorMsg}</DialogError>

  const reset = (): void => {
    setGlobalErrorMsg('')
    setAddress('')
  }

  const close = (): void => {
    if (isLoading) return
    reset()
    onCancel()
  }

  return (
    <LunaModal destroyOnClose wrapClassName="EnterAddress" onCancel={close} {...props}>
      <Dialog
        title="Claim Dust"
        rightButtonProps={{
          children: 'Proceed',
          type: 'default',
          onClick: async () => {
            setLoading(true)
            try {
              const balanceWithProof = await getEtcSnapshotBalanceWithProof(address)
              setLoading(false)
              reset()
              onNext(address, balanceWithProof)
            } catch (e) {
              setGlobalErrorMsg(e.message)
              setLoading(false)
            }
          },
          disabled: isDisabled,
        }}
        leftButtonProps={{
          onClick: close,
          disabled: isLoading,
        }}
        type="dark"
        footer={globalErrorElem}
      >
        <DialogInput
          label={`${chain.symbol} Public Address`}
          value={address}
          onChange={(e): void => {
            setAddress(e.target.value)
            setGlobalErrorMsg('')
          }}
          errorMessage={addressError}
        />
      </Dialog>
    </LunaModal>
  )
}
