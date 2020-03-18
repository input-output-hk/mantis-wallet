import React, {useState} from 'react'
import _ from 'lodash'
import {ModalProps} from 'antd/lib/modal'
import {toWei} from 'web3/lib/utils/utils.js'
import {LunaModal} from '../../common/LunaModal'
import {Dialog} from '../../common/Dialog'
import {DialogDropdown} from '../../common/dialog/DialogDropdown'
import {DialogInput} from '../../common/dialog/DialogInput'
import {DialogColumns} from '../../common/dialog/DialogColumns'
import {Account} from '../../web3'
import {DialogError} from '../../common/dialog/DialogError'
import {useIsMounted} from '../../common/hook-utils'
import {validateAmount} from '../../common/util'
import './SendTransaction.scss'

interface SendTransactionProps {
  accounts: Account[]
  onSend: (recipient: string, amount: number, fee: number) => Promise<void>
}

export const SendTransaction: React.FunctionComponent<SendTransactionProps & ModalProps> = ({
  accounts,
  onSend,
  ...props
}: SendTransactionProps & ModalProps) => {
  const [amount, setAmount] = useState('0')
  const [fee, setFee] = useState('0')
  const [recipient, setRecipient] = useState('')

  const mounted = useIsMounted()

  const [inProgress, setInProgress] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const disableSend = !!validateAmount(fee) || !!validateAmount(amount) || recipient.length === 0

  return (
    <LunaModal wrapClassName="SendTransaction" {...props}>
      <Dialog
        leftButtonProps={{
          onClick: props.onCancel,
        }}
        rightButtonProps={{
          children: 'Send →',
          onClick: async (): Promise<void> => {
            if (mounted.current) setInProgress(true)
            try {
              await onSend(recipient, Number(toWei(amount)), Number(toWei(fee)))
            } catch (e) {
              if (mounted.current) setErrorMessage(e.message)
            } finally {
              if (mounted.current) setInProgress(false)
            }
          },
          disabled: disableSend,
          loading: inProgress,
        }}
        type="dark"
        footer={errorMessage && <DialogError>{errorMessage}</DialogError>}
      >
        <DialogDropdown
          label="Select Account"
          options={accounts.map(({address}) => address).filter(_.isString)}
        />
        <DialogInput
          label="Recipient"
          onChange={(e): void => setRecipient(e.target.value)}
          errorMessage={recipient.length === 0 ? 'Recipient must be set' : ''}
        />
        <DialogColumns>
          <DialogInput label="Asset" value="DUST COIN" disabled />
          <DialogInput label="Memo" />
        </DialogColumns>
        <DialogColumns>
          <DialogInput
            label="Fee"
            defaultValue={fee}
            onChange={(e): void => setFee(e.target.value)}
            errorMessage={validateAmount(fee)}
          />
          <DialogInput
            label="Amount"
            defaultValue={amount}
            onChange={(e): void => setAmount(e.target.value)}
            errorMessage={validateAmount(amount)}
          />
        </DialogColumns>
      </Dialog>
    </LunaModal>
  )
}
