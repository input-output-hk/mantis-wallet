import React from 'react'
import {ModalProps} from 'antd/lib/modal'
import {LunaModal} from '../../common/LunaModal'
import {Dialog} from '../../common/Dialog'
import {DialogPrivateKey} from '../../common/dialog/DialogPrivateKey'

interface ReceiveTransactionProps {
  receiveAccount: string
  receiveAddress: string
  usedAddresses: Array<string>
}

export const ReceiveTransaction: React.FunctionComponent<ReceiveTransactionProps & ModalProps> = ({
  receiveAccount,
  receiveAddress,
  usedAddresses,
  ...props
}: ReceiveTransactionProps & ModalProps) => {
  return (
    <LunaModal
      footer={
        <div className="ReceiveModalFooter">
          <div className="title">Used addresses</div>
          {usedAddresses.map((address) => (
            <div key={address} className="address">
              {address}
            </div>
          ))}
        </div>
      }
      {...props}
    >
      <Dialog
        title={receiveAccount}
        prevButtonProps={{
          children: 'Copy Code',
          onClick: (): void => {
            navigator.clipboard.writeText(receiveAddress)
          },
        }}
        nextButtonProps={{
          type: 'default',
          children: 'Generate new →',
        }}
        type="dark"
      >
        <DialogPrivateKey privateKey={receiveAddress} />
      </Dialog>
    </LunaModal>
  )
}
