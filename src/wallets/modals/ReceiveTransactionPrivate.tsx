import React from 'react'
import {ModalProps} from 'antd/lib/modal'
import {LunaModal} from '../../common/LunaModal'
import {Dialog} from '../../common/Dialog'
import {DialogPrivateKey} from '../../common/dialog/DialogPrivateKey'
import {copyToClipboard} from '../../common/clipboard'

interface ReceiveTransactionPrivProps {
  privateAddress: string
}

export const ReceiveTransactionPrivate: React.FunctionComponent<ReceiveTransactionPrivProps &
  ModalProps> = ({privateAddress, ...props}: ReceiveTransactionPrivProps & ModalProps) => (
  <LunaModal {...props}>
    <Dialog
      title="Your private address"
      leftButtonProps={{
        children: 'Copy Code',
        onClick: (): void => {
          copyToClipboard(privateAddress)
        },
      }}
      rightButtonProps={{
        doNotRender: true,
      }}
      type="dark"
    >
      <DialogPrivateKey privateKey={privateAddress} />
    </Dialog>
  </LunaModal>
)
