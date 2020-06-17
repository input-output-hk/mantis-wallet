import React, {useState, PropsWithChildren} from 'react'
import _ from 'lodash/fp'
import BigNumber from 'bignumber.js'
import {ModalProps} from 'antd/lib/modal'
import {ModalLocker, ModalOnCancel, wrapWithModal} from '../../common/LunaModal'
import {Dialog} from '../../common/Dialog'
import {DialogDropdown} from '../../common/dialog/DialogDropdown'
import {DialogInput} from '../../common/dialog/DialogInput'
import {Account} from '../../web3'
import {
  validateAmount,
  isGreaterOrEqual,
  validateFee,
  createTxAmountValidator,
  createConfidentialAddressValidator,
  createTransparentAddressValidator,
} from '../../common/util'
import {UNITS} from '../../common/units'
import {DialogShowDust} from '../../common/dialog/DialogShowDust'
import {DialogTextSwitch} from '../../common/dialog/DialogTextSwitch'
import {DialogApproval} from '../../common/dialog/DialogApproval'
import {DialogFee, handleGasPriceUpdate} from '../../common/dialog/DialogFee'
import {FeeEstimates} from '../../common/wallet-state'
import {DialogError} from '../../common/dialog/DialogError'
import {useAsyncUpdate} from '../../common/hook-utils'
import {COULD_NOT_UPDATE_FEE_ESTIMATES} from '../../common/fee-estimate-strings'
import {BackendState, getNetworkTagOrTestnet} from '../../common/backend-state'
import './SendTransaction.scss'

const {Dust} = UNITS

interface SendToConfidentialDialogProps extends ModalOnCancel {
  estimateTransactionFee: (amount: BigNumber) => Promise<FeeEstimates>
  onSend: (recipient: string, amount: number, fee: number) => Promise<void>
  availableAmount: BigNumber
}

interface SendToTransparentDialogProps extends ModalOnCancel {
  estimateGasPrice: () => Promise<FeeEstimates>
  estimatePublicTransactionFee: (amount: BigNumber, recipient: string) => Promise<FeeEstimates>
  onSendToTransparent: (recipient: string, amount: BigNumber, gasPrice: BigNumber) => Promise<void>
  availableAmount: BigNumber
}

interface SendTransactionProps extends SendToConfidentialDialogProps, SendToTransparentDialogProps {
  accounts: Account[]
  defaultMode?: 'transparent' | 'confidential'
}

const SendToConfidentialDialog = ({
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

  // FIXME PM-2050 Fix error handling when amount is too big to estimate
  const footer =
    !feeEstimates || feeEstimateError == null ? (
      <></>
    ) : (
      <DialogError>{COULD_NOT_UPDATE_FEE_ESTIMATES}</DialogError>
    )

  return (
    <Dialog
      leftButtonProps={{
        onClick: onCancel,
        disabled: modalLocker.isLocked,
      }}
      rightButtonProps={{
        children: 'Send →',
        onClick: (): Promise<void> =>
          onSend(recipient, Number(Dust.toBasic(amount)), Number(Dust.toBasic(fee))),
        disabled: disableSend,
      }}
      onSetLoading={modalLocker.setLocked}
      footer={footer}
      type="dark"
    >
      {children}
      <DialogInput
        autoFocus
        label="Recipient"
        onChange={(e): void => setRecipient(e.target.value)}
        formItem={{
          name: 'confidential-recipient-name',
          rules: [{required: true, message: 'Recipient must be set'}, addressValidator],
        }}
      />
      <DialogInput
        label="Amount"
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
  estimateGasPrice,
  estimatePublicTransactionFee,
  availableAmount,
  onCancel,
  children,
}: PropsWithChildren<SendToTransparentDialogProps>): JSX.Element => {
  const [amount, setAmount] = useState('0')
  const [gasPrice, setGasPrice] = useState('1')
  const [recipient, setRecipient] = useState('')

  const modalLocker = ModalLocker.useContainer()
  const {networkTag} = BackendState.useContainer()

  const gasPriceError = validateAmount(gasPrice, [isGreaterOrEqual()])
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

  const [gasPriceEstimates, gasPriceEstimateError, isGasPricePending] = useAsyncUpdate(
    estimateGasPrice,
    [],
  )

  const disableSend =
    !!gasPriceError || !!gasPriceEstimateError || isGasPricePending || isFeeEstimationPending

  // FIXME PM-2050 Fix error handling when amount is too big to estimate
  const footer =
    !feeEstimates || feeEstimateError == null ? (
      <></>
    ) : (
      <DialogError>{COULD_NOT_UPDATE_FEE_ESTIMATES}</DialogError>
    )

  return (
    <Dialog
      leftButtonProps={{
        onClick: onCancel,
        disabled: modalLocker.isLocked,
      }}
      rightButtonProps={{
        children: 'Send →',
        onClick: (): Promise<void> =>
          onSendToTransparent(
            recipient,
            new BigNumber(Dust.toBasic(amount)),
            new BigNumber(gasPrice),
          ),
        disabled: disableSend,
      }}
      onSetLoading={modalLocker.setLocked}
      footer={footer}
      type="dark"
    >
      {children}
      <DialogInput
        label="Recipient"
        onChange={(e): void => setRecipient(e.target.value)}
        formItem={{
          name: 'transparent-recipient-name',
          rules: [{required: true, message: 'Recipient must be set'}, addressValidator],
        }}
      />
      <DialogInput
        label="Amount"
        onChange={(e): void => setAmount(e.target.value)}
        formItem={{
          name: 'transparent-tx-amount',
          initialValue: amount,
          rules: [txAmountValidator],
        }}
      />
      <DialogFee
        label="Fee"
        // show loading screen until gasPrices are loaded
        feeEstimates={gasPriceEstimates ? feeEstimates : undefined}
        onChange={handleGasPriceUpdate(setGasPrice, gasPriceEstimates)}
        errorMessage={gasPriceError}
        isPending={isFeeEstimationPending || isGasPricePending}
        hideCustom
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

export const _SendTransaction: React.FunctionComponent<SendTransactionProps & ModalProps> = ({
  accounts,
  availableAmount,
  estimateTransactionFee,
  onSend,
  estimateGasPrice,
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
          type="small"
          options={accounts.map(({address}) => address).filter(_.isString)}
        />
        <DialogShowDust amount={availableAmount}>Available Amount</DialogShowDust>
        <DialogTextSwitch
          label="Transaction Type"
          defaultMode={mode}
          buttonClassName="mode-switch"
          left={{label: 'Confidential', type: 'confidential'}}
          right={{label: 'Transparent', type: 'transparent'}}
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
          estimateGasPrice={estimateGasPrice}
          estimatePublicTransactionFee={estimatePublicTransactionFee}
          availableAmount={availableAmount}
        />
      </div>
    </>
  )
}

export const SendTransaction = wrapWithModal(_SendTransaction, 'SendTransactionModal')
