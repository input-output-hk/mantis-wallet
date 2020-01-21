import React from 'react'
import {ModalProps} from 'antd/lib/modal'
import {LunaModal} from '../../common/LunaModal'
import {Dialog} from '../../common/Dialog'
import {DialogDropdown} from '../../common/dialog/DialogDropdown'
import {DialogInput} from '../../common/dialog/DialogInput'
import {DialogColumns} from '../../common/dialog/DialogColumns'
import './SendTransaction.scss'

interface SendTransactionProps {
  accounts: string[]
}

export const SendTransaction: React.FunctionComponent<SendTransactionProps & ModalProps> = ({
  accounts,
  ...props
}: SendTransactionProps & ModalProps) => {
  return (
    <LunaModal wrapClassName="SendTransaction" {...props}>
      <Dialog
        prevButtonProps={{
          onClick: props.onCancel,
        }}
        nextButtonProps={{
          children: 'Send →',
          onClick: props.onCancel,
        }}
        type="dark"
      >
        <DialogDropdown label="Select Account" options={accounts} />
        <DialogInput label="Recipient" />
        <DialogColumns>
          <DialogInput label="Asset" value="DUST COIN" disabled />
          <DialogInput label="Amount" />
        </DialogColumns>
        <DialogInput label="Memo" />
        <DialogColumns>
          <div className="info-bar">Dust FEE 0.0000452BTC. $0.18</div>
          <div className="info-bar right">GAS Amount 0.0000452BTC. $0.18</div>
        </DialogColumns>
      </Dialog>
    </LunaModal>
  )
}
