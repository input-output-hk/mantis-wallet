import React from 'react'
import {ModalProps} from 'antd/lib/modal'
import {LunaModal} from '../../common/LunaModal'
import {Dialog} from '../../common/Dialog'
import {DialogAddress} from '../../common/dialog/DialogAddress'
import {DisplayChain, CHAINS} from '../../pob/chains'
import {ETC_CHAIN} from '../glacier-config'
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
          type: 'default',
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
          {/* FIXME: use dust asset below when it becomes available */}
          <DialogAddress chain={CHAINS.BTC_MAINNET} address={transparentAddress} />
        </div>
      </Dialog>
    </LunaModal>
  )
}
