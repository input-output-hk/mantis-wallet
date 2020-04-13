import React, {useState, PropsWithChildren} from 'react'
import _ from 'lodash'
import BigNumber from 'bignumber.js'
import {ModalProps} from 'antd/lib/modal'
import {LunaModal} from '../../common/LunaModal'
import {Dialog} from '../../common/Dialog'
import {DialogDropdown} from '../../common/dialog/DialogDropdown'
import {DialogInput} from '../../common/dialog/DialogInput'
import {DialogColumns} from '../../common/dialog/DialogColumns'
import {Account} from '../../web3'
import {DialogError} from '../../common/dialog/DialogError'
import {useIsMounted} from '../../common/hook-utils'
import {validateAmount, hasAtMostDecimalPlaces, isGreater} from '../../common/util'
import {UNITS} from '../../common/units'
import {DialogShowDust} from '../../common/dialog/DialogShowDust'
import {DialogTextSwitch} from '../../common/dialog/DialogTextSwitch'
import {DialogApproval} from '../../common/dialog/DialogApproval'

const {Dust} = UNITS

interface SendDialogProps {
  onSend: (recipient: string, amount: number, fee: number) => Promise<void>
  onCancel: () => void
}

interface SendToTransparentDialogProps {
  onSendToTransparent: (recipient: string, amount: BigNumber, gasPrice: BigNumber) => Promise<void>
  onCancel: () => void
}

interface SendTransactionProps extends SendDialogProps, SendToTransparentDialogProps {
  accounts: Account[]
  availableAmount: BigNumber
}

const SendDialog = ({
  onSend,
  onCancel,
  children,
}: PropsWithChildren<SendDialogProps>): JSX.Element => {
  const [amount, setAmount] = useState('0')
  const [fee, setFee] = useState('0')
  const [recipient, setRecipient] = useState('')

  const mounted = useIsMounted()

  const [inProgress, setInProgress] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const disableSend = !!validateAmount(fee) || !!validateAmount(amount) || recipient.length === 0

  return (
    <Dialog
      leftButtonProps={{
        onClick: onCancel,
      }}
      rightButtonProps={{
        children: 'Send →',
        onClick: async (): Promise<void> => {
          if (mounted.current) setInProgress(true)
          try {
            await onSend(recipient, Number(Dust.toBasic(amount)), Number(Dust.toBasic(fee)))
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
      {children}
      <DialogInput
        label="Recipient"
        onChange={(e): void => setRecipient(e.target.value)}
        errorMessage={recipient.length === 0 ? 'Recipient must be set' : ''}
      />
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
  )
}

const SendToTransparentDialog = ({
  onSendToTransparent,
  onCancel,
  children,
}: PropsWithChildren<SendToTransparentDialogProps>): JSX.Element => {
  const [amount, setAmount] = useState('0')
  const [gasPrice, setGasPrice] = useState('1')
  const [recipient, setRecipient] = useState('')
  const [approval, setApproval] = useState(false)

  const mounted = useIsMounted()

  const [inProgress, setInProgress] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const amountError = validateAmount(amount)
  const gasPriceError = validateAmount(gasPrice, [isGreater(), hasAtMostDecimalPlaces(0)])
  const disableSend = !!gasPriceError || !!amountError || recipient.length === 0 || !approval

  return (
    <Dialog
      leftButtonProps={{
        onClick: onCancel,
      }}
      rightButtonProps={{
        children: 'Send →',
        onClick: async (): Promise<void> => {
          if (mounted.current) setInProgress(true)
          try {
            await onSendToTransparent(
              recipient,
              new BigNumber(Dust.toBasic(amount)),
              new BigNumber(gasPrice),
            )
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
      {children}
      <DialogInput
        label="Recipient"
        onChange={(e): void => setRecipient(e.target.value)}
        errorMessage={recipient.length === 0 ? 'Recipient must be set' : ''}
      />
      <DialogColumns>
        <DialogInput
          label="Gas Price (in Atoms)"
          defaultValue={gasPrice}
          onChange={(e): void => setGasPrice(e.target.value)}
          errorMessage={gasPriceError}
        />
        <DialogInput
          label="Amount"
          defaultValue={amount}
          onChange={(e): void => setAmount(e.target.value)}
          errorMessage={amountError}
        />
      </DialogColumns>
      <DialogApproval
        checked={approval}
        onChange={setApproval}
        description={
          <>
            <b>Warning:</b> I understand that the funds included in this transaction will no longer
            be confidential.
          </>
        }
      />
    </Dialog>
  )
}

export const SendTransaction: React.FunctionComponent<SendTransactionProps & ModalProps> = ({
  accounts,
  availableAmount,
  onSend,
  onSendToTransparent,
  ...props
}: SendTransactionProps & ModalProps) => {
  const [mode, setMode] = useState<'transparent' | 'confidential'>('confidential')

  return (
    <LunaModal wrapClassName="SendTransaction" {...props}>
      <Dialog
        leftButtonProps={{
          doNotRender: true,
        }}
        rightButtonProps={{
          doNotRender: true,
        }}
      >
        <DialogTextSwitch
          defaultMode={mode}
          left={{label: 'Confidential', type: 'confidential'}}
          right={{label: 'Transparent', type: 'transparent'}}
          onChange={setMode}
        />
        <DialogDropdown
          label="Select Account"
          options={accounts.map(({address}) => address).filter(_.isString)}
        />
        <DialogShowDust amount={availableAmount}>Available Amount</DialogShowDust>
      </Dialog>
      <div style={{display: mode === 'confidential' ? 'block' : 'none'}}>
        <SendDialog onCancel={props.onCancel} onSend={onSend} />
      </div>
      <div style={{display: mode === 'transparent' ? 'block' : 'none'}}>
        <SendToTransparentDialog
          onCancel={props.onCancel}
          onSendToTransparent={onSendToTransparent}
        />
      </div>
    </LunaModal>
  )
}
