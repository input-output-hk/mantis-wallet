import React, {useState, FunctionComponent} from 'react'
import BigNumber from 'bignumber.js'
import {ModalProps} from 'antd/lib/modal'
import {ModalLocker, wrapWithModal} from '../../common/LunaModal'
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
import {DialogAddressSelect} from '../../common/dialog/DialogAddressSelect'
import {DialogFee} from '../../common/dialog/DialogFee'
import {FeeEstimates, LoadedState} from '../../common/wallet-state'
import {useAsyncUpdate} from '../../common/hook-utils'
import {useTranslation} from '../../settings-state'
import {Trans} from '../../common/Trans'
import './SendTransaction.scss'

interface SendTransactionProps {
  availableAmount: Wei
  onSend: LoadedState['sendTransaction']
  estimateTransactionFee: () => Promise<FeeEstimates>
}

export const _SendTransaction: FunctionComponent<SendTransactionProps & ModalProps> = ({
  availableAmount,
  onSend,
  estimateTransactionFee,
  onCancel,
}: SendTransactionProps & ModalProps) => {
  const {t} = useTranslation()
  const modalLocker = ModalLocker.useContainer()

  const [amount, setAmount] = useState('0')
  const [fee, setFee] = useState('0')
  const [recipient, setRecipient] = useState('')
  const [password, setPassword] = useState('')

  const feeValidationResult = validateFee(fee)
  const txAmountValidator = createTxAmountValidator(t, availableAmount)
  const addressValidator = toAntValidator(t, validateAddress)

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
          onClick: (): Promise<void> => onSend(recipient, asEther(amount), asEther(fee), password),
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

export const SendTransaction = wrapWithModal(_SendTransaction, 'SendTransactionModal')
