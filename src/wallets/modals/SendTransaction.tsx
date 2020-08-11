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
  translateValidationResult,
  toAntValidator,
} from '../../common/util'
import {UNITS} from '../../common/units'
import {DialogShowDust} from '../../common/dialog/DialogShowDust'
import {DialogTextSwitch} from '../../common/dialog/DialogTextSwitch'
import {DialogApproval} from '../../common/dialog/DialogApproval'
import {DialogFee} from '../../common/dialog/DialogFee'
import {FeeEstimates} from '../../common/wallet-state'
import {useAsyncUpdate} from '../../common/hook-utils'
import {BackendState, getNetworkTagOrTestnet} from '../../common/backend-state'
import {useTranslation} from '../../settings-state'
import {Trans} from '../../common/Trans'
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
  const {networkTag} = BackendState.useContainer()
  const {t} = useTranslation()
  const modalLocker = ModalLocker.useContainer()

  const [amount, setAmount] = useState('0')
  const [fee, setFee] = useState('0')
  const [recipient, setRecipient] = useState('')

  const feeValidationResult = validateFee(fee)
  const txAmountValidator = createTxAmountValidator(t, availableAmount)
  const addressValidator = toAntValidator(
    t,
    createConfidentialAddressValidator(getNetworkTagOrTestnet(networkTag)),
  )

  const [feeEstimates, feeEstimateError, isFeeEstimationPending] = useAsyncUpdate(
    (): Promise<FeeEstimates> => estimateTransactionFee(Dust.toBasic(new BigNumber(amount))),
    [amount],
    () => (amount === '0' ? Promise.resolve() : txAmountValidator.validator({}, amount)),
  )

  const disableSend = feeValidationResult !== 'OK' || !feeEstimates

  return (
    <Dialog
      leftButtonProps={{
        onClick: onCancel,
        disabled: modalLocker.isLocked,
      }}
      rightButtonProps={{
        children: t(['wallet', 'button', 'sendTransaction']),
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
        label={t(['wallet', 'label', 'receivingAddress'])}
        id="confidential-recipient-name"
        onChange={(e): void => setRecipient(e.target.value)}
        formItem={{
          name: 'confidential-recipient-name',
          rules: [
            {required: true, message: t(['wallet', 'error', 'receivingAddressMustBe'])},
            addressValidator,
          ],
        }}
      />
      <DialogInput
        label={t(['wallet', 'label', 'amount'])}
        id="confidential-tx-amount"
        onChange={(e): void => setAmount(e.target.value)}
        formItem={{
          name: 'confidential-tx-amount',
          initialValue: amount,
          rules: [txAmountValidator],
        }}
      />
      <DialogFee
        label={t(['wallet', 'label', 'transactionFee'])}
        feeEstimates={feeEstimates}
        feeEstimateError={feeEstimateError}
        defaultValue={fee}
        onChange={(fee: string): void => setFee(fee)}
        isPending={isFeeEstimationPending}
        errorMessage={translateValidationResult(t, feeValidationResult)}
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
  const {networkTag} = BackendState.useContainer()
  const {t} = useTranslation()
  const modalLocker = ModalLocker.useContainer()

  const [amount, setAmount] = useState('0')
  const [fee, setFee] = useState('0')
  const [recipient, setRecipient] = useState('')

  const feeValidationResult = validateFee(fee)
  const txAmountValidator = createTxAmountValidator(t, availableAmount)
  const addressValidator = toAntValidator(
    t,
    createTransparentAddressValidator(getNetworkTagOrTestnet(networkTag)),
  )

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

  const disableSend = feeValidationResult !== 'OK' || !feeEstimates

  return (
    <Dialog
      leftButtonProps={{
        onClick: onCancel,
        disabled: modalLocker.isLocked,
      }}
      rightButtonProps={{
        children: t(['wallet', 'button', 'sendTransaction']),
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
        label={t(['wallet', 'label', 'receivingAddress'])}
        id="transparent-recipient-name"
        onChange={(e): void => setRecipient(e.target.value)}
        formItem={{
          name: 'transparent-recipient-name',
          rules: [
            {required: true, message: t(['wallet', 'error', 'receivingAddressMustBe'])},
            addressValidator,
          ],
        }}
      />
      <DialogInput
        label={t(['wallet', 'label', 'amount'])}
        id="transparent-tx-amount"
        onChange={(e): void => setAmount(e.target.value)}
        formItem={{
          name: 'transparent-tx-amount',
          initialValue: amount,
          rules: [txAmountValidator],
        }}
      />
      <DialogFee
        label={t(['wallet', 'label', 'transactionFee'])}
        feeEstimates={feeEstimates}
        feeEstimateError={feeEstimateError}
        onChange={setFee}
        errorMessage={translateValidationResult(t, feeValidationResult)}
        isPending={isFeeEstimationPending}
      />
      <DialogApproval
        id="no-longer-confidential-warning"
        description={<Trans k={['wallet', 'message', 'transparentTransactionWarning']} />}
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
  const {t} = useTranslation()

  const [mode, setMode] = useState(defaultMode)
  const modalLocker = ModalLocker.useContainer()

  const title =
    mode === 'confidential'
      ? t(['wallet', 'title', 'sendFromConfidentialToConfidential'])
      : t(['wallet', 'title', 'sendFromConfidentialToTransparent'])

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
          label={t(['wallet', 'label', 'selectAccount'])}
          options={accounts.map(({address}) => address).filter(_.isString)}
        />
        <DialogShowDust amount={availableAmount}>
          <Trans k={['wallet', 'label', 'availableAmount']} />
        </DialogShowDust>
        <DialogTextSwitch
          label={t(['wallet', 'label', 'transactionTypeLong'])}
          defaultMode={mode}
          buttonClassName="mode-switch"
          left={{label: t(['wallet', 'transactionType', 'transparent']), type: 'transparent'}}
          right={{label: t(['wallet', 'transactionType', 'confidential']), type: 'confidential'}}
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
