import React from 'react'
import {ModalProps} from 'antd/lib/modal'
import {LunaModal} from '../../common/LunaModal'
import {Dialog} from '../../common/Dialog'
import {DialogInput} from '../../common/dialog/DialogInput'
import {copyToClipboard} from '../../common/clipboard'
import {normalizeAddress} from '../glacier-state'
import './GeneratedMessage.scss'

interface GeneratedMessageProps {
  transparentAddress: string
  externalAddress: string
  onNext: () => void
}

export const GeneratedMessage = ({
  transparentAddress,
  externalAddress,
  onNext,
  ...props
}: GeneratedMessageProps & ModalProps): JSX.Element => {
  // TODO: get authorization message from an endpoint
  const normalizedEtcAddress = normalizeAddress(externalAddress)
  const msg = `I authorise ${transparentAddress} to get my ${normalizedEtcAddress} GlacierDrop`

  return (
    <LunaModal wrapClassName="GeneratedMessage" {...props}>
      <Dialog
        title="Claim Dust"
        leftButtonProps={{
          autoFocus: true,
          children: 'Copy Message',
          onClick: () => copyToClipboard(msg),
        }}
        rightButtonProps={{
          children: 'Confirm',
          onClick: () => onNext(),
          type: 'default',
        }}
        type="dark"
      >
        <DialogInput label="Generated Message" value={msg} disabled={true} />
        <div className="more-info">view compatible wallets & software</div>
      </Dialog>
    </LunaModal>
  )
}
