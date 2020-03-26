import React from 'react'
import {ModalProps} from 'antd/lib/modal'
import {LunaModal} from '../../common/LunaModal'
import {Dialog} from '../../common/Dialog'
import {DialogAddress} from '../../common/dialog/DialogAddress'
import {Chain, CHAINS} from '../../pob/chains'
import './VerifyAddress.scss'

interface VerifyAddressProps {
  chain: Chain
  externalAddress: string
  midnightAddress: string
  onNext: () => void
  onCancel: () => void
}

export const VerifyAddress = ({
  chain,
  externalAddress,
  midnightAddress,
  onNext,
  onCancel,
  ...props
}: VerifyAddressProps & ModalProps): JSX.Element => {
  return (
    <LunaModal destroyOnClose wrapClassName="VerifyAddress" {...props}>
      <Dialog
        title="Claim Dust"
        rightButtonProps={{
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
          <DialogAddress chain={CHAINS.BTC_MAINNET} address={midnightAddress} />
        </div>
      </Dialog>
    </LunaModal>
  )
}
