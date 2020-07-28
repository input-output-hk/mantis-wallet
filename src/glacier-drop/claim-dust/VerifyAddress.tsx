import React from 'react'
import {ModalProps} from 'antd/lib/modal'
import {LunaModal} from '../../common/LunaModal'
import {Dialog} from '../../common/Dialog'
import {DialogAddress} from '../../common/dialog/DialogAddress'
import {Chain, DST_CHAIN, ETC_CHAIN} from '../../common/chains'
import './VerifyAddress.scss'

interface VerifyAddressProps {
  externalAddress: string
  transparentAddress: string
  onNext: () => void
  onCancel: () => void
  chain?: Chain
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
          <DialogAddress svgLogo={chain.logo} address={externalAddress} />
        </div>
        <div className="section">
          <div className="label">Midnight Address</div>
          <DialogAddress svgLogo={DST_CHAIN.logo} address={transparentAddress} />
        </div>
      </Dialog>
    </LunaModal>
  )
}
