import React, {useState, FunctionComponent} from 'react'
import BigNumber from 'bignumber.js'
import {ModalProps} from 'antd/lib/modal'
import {ModalLocker, wrapWithModal} from '../../common/MantisModal'
import {Dialog} from '../../common/Dialog'
import {DialogInput, DialogInputPassword} from '../../common/dialog/DialogInput'
import {DialogColumns} from '../../common/dialog/DialogColumns'
import {
  validateFee,
  createTxAmountValidator,
  validateAddress,
  translateValidationResult,
  toAntValidator,
} from '../../common/util'
import {Wei, asWei, asEther} from '../../common/units'
import {DialogShowAmount} from '../../common/dialog/DialogShowAmount'
import {DialogAddressSelect} from '../../address-book/DialogAddressSelect'
import {DialogFee} from '../../common/dialog/DialogFee'
import {FeeEstimates, LoadedState} from '../../common/wallet-state'
import {useAsyncUpdate} from '../../common/hook-utils'
import {useTranslation} from '../../settings-state'
import {Trans} from '../../common/Trans'
import './SendTransaction.scss'

interface SendTransactionProps {
  onSend: () => void
  availableAmount: Wei
  fee: string
  setFee: React.Dispatch<React.SetStateAction<string>>
  amount: string
  setAmount: React.Dispatch<React.SetStateAction<string>>
  recipient: string
  setRecipient: React.Dispatch<React.SetStateAction<string>>
  setData: React.Dispatch<React.SetStateAction<string>>
  estimateTransactionFee: () => Promise<FeeEstimates>
}

const SendTransaction: FunctionComponent<SendTransactionProps & ModalProps> = ({
  estimateTransactionFee,
  availableAmount,
  onCancel,
  onSend,
  amount,
  setAmount,
  fee,
  setFee,
  recipient,
  setRecipient,
  setData,
}: SendTransactionProps & ModalProps) => {
  const {t} = useTranslation()
  const modalLocker = ModalLocker.useContainer()

  const addressValidator = toAntValidator(t, validateAddress)
  const txAmountValidator = createTxAmountValidator(t, availableAmount)

  const feeValidationResult = validateFee(fee)

  const [feeEstimates, feeEstimateError, isFeeEstimationPending] = useAsyncUpdate(
    estimateTransactionFee,
    [],
  )

  const totalAmount = asEther(new BigNumber(amount).plus(fee))

  const remainingBalance = asWei(
    totalAmount.isFinite() ? availableAmount.minus(totalAmount) : availableAmount,
  )

  const disableSend =
    feeValidationResult !== 'OK' || !feeEstimates || !remainingBalance.isPositive()

  return (
    <>
      <Dialog
        title={t(['wallet', 'title', 'send'])}
        leftButtonProps={{
          onClick: onCancel,
          disabled: modalLocker.isLocked,
        }}
        rightButtonProps={{
          children: t(['wallet', 'button', 'sendTransaction']),
          onClick: onSend,
          disabled: disableSend,
        }}
        onSetLoading={modalLocker.setLocked}
        type="dark"
      >
        <DialogAddressSelect
          addressValidator={addressValidator}
          setRecipient={setRecipient}
          recipient={recipient}
        />
        <DialogInput
          label={t(['wallet', 'label', 'amount'])}
          id="tx-amount"
          onChange={(e): void => setAmount(e.target.value)}
          formItem={{
            name: 'tx-amount',
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
        <DialogInput
          label="Data"
          id="tx-data"
          onChange={(e): void => setData(e.target.value)}
          formItem={{
            name: 'tx-data',
            initialValue: '',
          }}
        />
        <DialogColumns>
          <DialogShowAmount amount={totalAmount} displayExact>
            <Trans k={['wallet', 'label', 'totalTransactionAmount']} />
          </DialogShowAmount>
          <DialogShowAmount amount={remainingBalance} displayExact>
            <Trans k={['wallet', 'label', 'remainingBalance']} />
          </DialogShowAmount>
        </DialogColumns>
      </Dialog>
    </>
  )
}

interface ConfirmTransactionProps {
  onSend: LoadedState['sendTransaction']
  amount: string
  fee: string
  recipient: string
  data: string
}

const ConfirmTransaction: FunctionComponent<ConfirmTransactionProps & ModalProps> = ({
  amount,
  fee,
  recipient,
  data,
  onSend,
  onCancel,
}: ConfirmTransactionProps & ModalProps) => {
  const {t} = useTranslation()
  const modalLocker = ModalLocker.useContainer()

  const [password, setPassword] = useState('')

  return (
    <>
      <Dialog
        title="Confirm transaction"
        leftButtonProps={{
          children: 'Back',
          onClick: onCancel,
          disabled: modalLocker.isLocked,
        }}
        rightButtonProps={{
          children: 'Confirm',
          onClick: (): Promise<void> =>
            onSend(recipient, asEther(amount), asEther(fee), password, data),
        }}
        onSetLoading={modalLocker.setLocked}
        type="dark"
      >
        <DialogInput value={recipient} label="Recipient" disabled={true} />
        <DialogShowAmount amount={asEther(amount)} displayExact>
          Amount
        </DialogShowAmount>
        <DialogShowAmount amount={asEther(fee)} displayExact>
          Fee
        </DialogShowAmount>
        <DialogInput value={data} label="Data" disabled={true} />
        <DialogInputPassword
          label={t(['wallet', 'label', 'password'])}
          id="tx-password"
          onChange={(e): void => setPassword(e.target.value)}
          formItem={{
            name: 'tx-password',
            initialValue: password,
            rules: [{required: true, message: t(['wallet', 'error', 'passwordMustBeProvided'])}],
          }}
        />
      </Dialog>
    </>
  )
}

interface SendTransactionFlowProps {
  availableAmount: Wei
  onSend: LoadedState['sendTransaction']
  estimateTransactionFee: () => Promise<FeeEstimates>
}

export const _SendTransactionFlow: FunctionComponent<SendTransactionFlowProps & ModalProps> = ({
  availableAmount,
  onSend,
  estimateTransactionFee,
  onCancel,
}: SendTransactionFlowProps & ModalProps) => {
  const [amount, setAmount] = useState('0')
  const [fee, setFee] = useState('0')
  const [recipient, setRecipient] = useState('')
  const [data, setData] = useState('')
  const [step, setStep] = useState<'send' | 'confirm'>('send')

  if (step === 'confirm') {
    return (
      <ConfirmTransaction
        amount={amount}
        fee={fee}
        recipient={recipient}
        data={data}
        onSend={onSend}
        onCancel={() => setStep('send')}
      />
    )
  } else {
    return (
      <SendTransaction
        amount={amount}
        setAmount={setAmount}
        fee={fee}
        setFee={setFee}
        recipient={recipient}
        setRecipient={setRecipient}
        setData={setData}
        onSend={() => setStep('confirm')}
        availableAmount={availableAmount}
        estimateTransactionFee={estimateTransactionFee}
        onCancel={onCancel}
      />
    )
  }
}

export const SendTransactionFlow = wrapWithModal(_SendTransactionFlow, 'SendTransactionModal')
