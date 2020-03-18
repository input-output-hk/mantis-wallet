import React, {useState} from 'react'
import {ModalProps} from 'antd/lib/modal'
import {LunaModal} from '../../common/LunaModal'
import {Dialog} from '../../common/Dialog'
import {DialogInput} from '../../common/dialog/DialogInput'
import {Chain} from '../../pob/chains'

interface EnterAddressProps {
  chain: Chain
  onNext: (address: string) => void
  onCancel: () => void
}

export const EnterAddress = ({
  chain,
  onNext,
  onCancel,
  ...props
}: EnterAddressProps & ModalProps): JSX.Element => {
  const [address, setAddress] = useState<string>('')

  const addressError = address.length === 0 ? 'Address must be set' : ''
  const disabled = addressError != ''

  return (
    <LunaModal destroyOnClose wrapClassName="EnterAddress" {...props}>
      <Dialog
        title="Claim Dust"
        rightButtonProps={{
          children: 'Proceed',
          type: 'default',
          onClick: () => onNext(address),
          disabled,
        }}
        leftButtonProps={{
          onClick: onCancel,
        }}
        type="dark"
      >
        <DialogInput
          label={`${chain.symbol} Public Address`}
          onChange={(e): void => setAddress(e.target.value)}
          errorMessage={addressError}
        />
      </Dialog>
    </LunaModal>
  )
}
