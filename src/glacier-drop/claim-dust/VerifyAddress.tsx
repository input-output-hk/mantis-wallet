import React from 'react'
import {ModalProps} from 'antd/lib/modal'
import {LunaModal} from '../../common/LunaModal'
import {Dialog} from '../../common/Dialog'
import {DialogAddress} from '../../common/dialog/DialogAddress'
import {DST_CHAIN} from '../../common/chains'
import {GdChain, ETC_CHAIN} from '../gd-chains'
import {Trans} from '../../common/Trans'
import './VerifyAddress.scss'

interface VerifyAddressProps {
  externalAddress: string
  transparentAddress: string
  onNext: () => void
  onCancel: () => void
  chain?: GdChain
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
        title={<Trans k={['glacierDrop', 'title', 'claimDust']} />}
        rightButtonProps={{
          autoFocus: true,
          children: <Trans k={['glacierDrop', 'button', 'generateMessage']} />,
          onClick: () => onNext(),
        }}
        leftButtonProps={{
          onClick: onCancel,
        }}
        type="dark"
      >
        <div className="section">
          <div className="label">
            <Trans k={chain.translations.address} />
          </div>
          <DialogAddress svgLogo={chain.logo} address={externalAddress} />
        </div>
        <div className="section">
          <div className="label">
            <Trans k={['glacierDrop', 'label', 'midnightAddress']} />
          </div>
          <DialogAddress svgLogo={DST_CHAIN.logo} address={transparentAddress} />
        </div>
      </Dialog>
    </LunaModal>
  )
}
