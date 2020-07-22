import React, {useState, PropsWithChildren, FunctionComponent} from 'react'
import _ from 'lodash/fp'
import BigNumber from 'bignumber.js'
import {ModalProps} from 'antd/lib/modal'
import {ModalLocker, ModalOnCancel, wrapWithModal} from '../../common/LunaModal'
import {Dialog} from '../../common/Dialog'
import {DialogDropdown} from '../../common/dialog/DialogDropdown'
import {DialogInput} from '../../common/dialog/DialogInput'
import {Account} from '../../web3'
import {
  validateFee,
  createTxAmountValidator,
  createConfidentialAddressValidator,
  createTransparentAddressValidator,
} from '../../common/util'
import {UNITS} from '../../common/units'
import {DialogShowDust} from '../../common/dialog/DialogShowDust'
import {DialogTextSwitch} from '../../common/dialog/DialogTextSwitch'
import {DialogApproval} from '../../common/dialog/DialogApproval'
import {DialogFee} from '../../common/dialog/DialogFee'
import {FeeEstimates} from '../../common/wallet-state'
import {useAsyncUpdate} from '../../common/hook-utils'
import {BackendState, getNetworkTagOrTestnet} from '../../common/backend-state'
import './SendTransaction.scss'

const {Dust} = UNITS

interface SendToConfidentialDialogProps extends ModalOnCancel {
  estimateTransactionFee: (amount: BigNumber) => Promise<FeeEstimates>
  onSend: (recipient: string, amount: number, fee: number) => Promise<void>
  availableAmount: BigNumber
}

interface SendToTransparentDialogProps extends ModalOnCancel {
  estimatePublicTransactionFee: (amount: BigNumber, recipient: string) => Promise<FeeEstimates>
  onSendToTransparent: (recipient: string, amount: BigNumber, fee: BigNumber) => Promise<void>
  availableAmount: BigNumber
}

export interface SendTransactionProps
  extends SendToConfidentialDialogProps,
    SendToTransparentDialogProps {
  accounts: Account[]
  defaultMode?: 'transparent' | 'confidential'
}

export const SendToConfidentialDialog = ({
  estimateTransactionFee,
  onSend,
  availableAmount,
  onCancel,
  children,
}: PropsWithChildren<SendToConfidentialDialogProps>): JSX.Element => {
  const [amount, setAmount] = useState('0')
  const [fee, setFee] = useState('0')
  const [recipient, setRecipient] = useState('')

  const modalLocker = ModalLocker.useContainer()
  const {networkTag} = BackendState.useContainer()

  const feeError = validateFee(fee)
  const txAmountValidator = createTxAmountValidator(availableAmount)
  const addressValidator = createConfidentialAddressValidator(getNetworkTagOrTestnet(networkTag))

  const [feeEstimates, feeEstimateError, isFeeEstimationPending] = useAsyncUpdate(
    (): Promise<FeeEstimates> => estimateTransactionFee(Dust.toBasic(new BigNumber(amount))),
    [amount],
    () => (amount === '0' ? Promise.resolve() : txAmountValidator.validator({}, amount)),
  )

  const disableSend = !!feeError || isFeeEstimationPending

  return (
    <Dialog
      leftButtonProps={{
        onClick: onCancel,
        disabled: modalLocker.isLocked,
      }}
      rightButtonProps={{
        children: 'Send',
        onClick: (): Promise<void> =>
          onSend(recipient, Number(Dust.toBasic(amount)), Number(Dust.toBasic(fee))),
        disabled: disableSend,
      }}
      onSetLoading={modalLocker.setLocked}
      type="dark"
    >
      {children}
      <DialogInput
        autoFocus
        label="Recipient"
        id="confidential-recipient-name"
        onChange={(e): void => setRecipient(e.target.value)}
        formItem={{
          name: 'confidential-recipient-name',
          rules: [{required: true, message: 'Recipient must be set'}, addressValidator],
        }}
      />
      <DialogInput
        label="Amount"
        id="confidential-tx-amount"
        onChange={(e): void => setAmount(e.target.value)}
        formItem={{
          name: 'confidential-tx-amount',
          initialValue: amount,
          rules: [txAmountValidator],
        }}
      />
      <DialogFee
        label="Fee"
        feeEstimates={feeEstimates}
        feeEstimateError={feeEstimateError}
        defaultValue={fee}
        onChange={(fee: string): void => setFee(fee)}
        isPending={isFeeEstimationPending}
        errorMessage={feeError}
      />
    </Dialog>
  )
}

const SendToTransparentDialog = ({
  onSendToTransparent,
  estimatePublicTransactionFee,
  availableAmount,
  onCancel,
  children,
}: PropsWithChildren<SendToTransparentDialogProps>): JSX.Element => {
  const [amount, setAmount] = useState('0')
  const [fee, setFee] = useState('0')
  const [recipient, setRecipient] = useState('')

  const modalLocker = ModalLocker.useContainer()
  const {networkTag} = BackendState.useContainer()

  const feeError = validateFee(fee)
  const txAmountValidator = createTxAmountValidator(availableAmount)
  const addressValidator = createTransparentAddressValidator(getNetworkTagOrTestnet(networkTag))

  const [feeEstimates, feeEstimateError, isFeeEstimationPending] = useAsyncUpdate(
    (): Promise<FeeEstimates> =>
      estimatePublicTransactionFee(Dust.toBasic(new BigNumber(amount)), recipient),
    [amount, recipient],
    () =>
      recipient === '' && amount === '0'
        ? Promise.resolve()
        : txAmountValidator
            .validator({}, amount)
            .then(() => addressValidator.validator({}, recipient)),
  )

  const disableSend = !!feeError || !!feeEstimateError || isFeeEstimationPending

  return (
    <Dialog
      leftButtonProps={{
        onClick: onCancel,
        disabled: modalLocker.isLocked,
      }}
      rightButtonProps={{
        children: 'Send',
        onClick: (): Promise<void> =>
          onSendToTransparent(
            recipient,
            new BigNumber(Dust.toBasic(amount)),
            new BigNumber(Dust.toBasic(fee)),
          ),
        disabled: disableSend,
      }}
      onSetLoading={modalLocker.setLocked}
      type="dark"
    >
      {children}
      <DialogInput
        label="Recipient"
        id="transparent-recipient-name"
        onChange={(e): void => setRecipient(e.target.value)}
        formItem={{
          name: 'transparent-recipient-name',
          rules: [{required: true, message: 'Recipient must be set'}, addressValidator],
        }}
      />
      <DialogInput
        label="Amount"
        id="transparent-tx-amount"
        onChange={(e): void => setAmount(e.target.value)}
        formItem={{
          name: 'transparent-tx-amount',
          initialValue: amount,
          rules: [txAmountValidator],
        }}
      />
      <DialogFee
        label="Fee"
        feeEstimates={feeEstimates}
        feeEstimateError={feeEstimateError}
        onChange={setFee}
        errorMessage={feeError}
        isPending={isFeeEstimationPending}
      />
      <DialogApproval
        id="no-longer-confidential-warning"
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

export const _SendTransaction: FunctionComponent<SendTransactionProps & ModalProps> = ({
  accounts,
  availableAmount,
  estimateTransactionFee,
  onSend,
  estimatePublicTransactionFee,
  onSendToTransparent,
  defaultMode = 'confidential',
  ...props
}: SendTransactionProps & ModalProps) => {
  const [mode, setMode] = useState(defaultMode)
  const modalLocker = ModalLocker.useContainer()

  const title = `Confidential → ${_.capitalize(mode)}`

  return (
    <>
      <Dialog
        title={title}
        leftButtonProps={{
          doNotRender: true,
        }}
        rightButtonProps={{
          doNotRender: true,
        }}
      >
        <DialogDropdown
          label="Select Account"
          options={accounts.map(({address}) => address).filter(_.isString)}
        />
        <DialogShowDust amount={availableAmount}>Available Amount</DialogShowDust>
        <DialogTextSwitch
          label="Transaction Type"
          defaultMode={mode}
          buttonClassName="mode-switch"
          left={{label: 'Transparent', type: 'transparent'}}
          right={{label: 'Confidential', type: 'confidential'}}
          disabled={modalLocker.isLocked}
          onChange={setMode}
        />
      </Dialog>
      <div style={{display: mode === 'confidential' ? 'block' : 'none'}}>
        <SendToConfidentialDialog
          onCancel={props.onCancel}
          onSend={onSend}
          estimateTransactionFee={estimateTransactionFee}
          availableAmount={availableAmount}
        />
      </div>
      <div style={{display: mode === 'transparent' ? 'block' : 'none'}}>
        <SendToTransparentDialog
          onCancel={props.onCancel}
          onSendToTransparent={onSendToTransparent}
          estimatePublicTransactionFee={estimatePublicTransactionFee}
          availableAmount={availableAmount}
        />
      </div>
    </>
  )
}

export const SendTransaction = wrapWithModal(_SendTransaction, 'SendTransactionModal')
