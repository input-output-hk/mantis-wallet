import React from 'react'
import {ModalProps} from 'antd/lib/modal'
import {LunaModal} from '../../common/LunaModal'
import {Dialog} from '../../common/Dialog'
import {DialogAddress} from '../../common/dialog/DialogAddress'
import {DisplayChain} from '../../pob/chains'
import {ETC_CHAIN, MIDNIGHT_CHAIN} from '../glacier-config'
import './VerifyAddress.scss'

interface VerifyAddressProps {
  externalAddress: string
  transparentAddress: string
  onNext: () => void
  onCancel: () => void
  chain?: DisplayChain
}

export const VerifyAddress = ({
  externalAddress,
  transparentAddress,
  onNext,
  onCancel,
  chain = ETC_CHAIN,
  ...props
}: VerifyAddressProps & ModalProps): JSX.Element => {
  return (
    <LunaModal wrapClassName="VerifyAddress" onCancel={onCancel} {...props}>
      <Dialog
        title="Claim Dust"
        rightButtonProps={{
          autoFocus: true,
          children: 'Generate Message',
          onClick: () => onNext(),
        }}
        leftButtonProps={{
          onClick: onCancel,
        }}
        type="dark"
      >
        <div className="section">
          <div className="label">{chain.symbol} Address</div>
          <DialogAddress chain={chain} address={externalAddress} />
        </div>
        <div className="section">
          <div className="label">Midnight Address</div>
          <DialogAddress chain={MIDNIGHT_CHAIN} address={transparentAddress} />
        </div>
      </Dialog>
    </LunaModal>
  )
}
