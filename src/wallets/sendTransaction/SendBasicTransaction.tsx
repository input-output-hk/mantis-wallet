import React from 'react'
import BigNumber from 'bignumber.js'
import {ModalProps} from 'antd/lib/modal'
import {ModalLocker} from '../../common/MantisModal'
import {Dialog} from '../../common/Dialog'
import {DialogInput} from '../../common/dialog/DialogInput'
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
import {FeeEstimates} from '../../common/wallet-state'
import {useAsyncUpdate} from '../../common/hook-utils'
import {useTranslation} from '../../settings-state'
import {Trans} from '../../common/Trans'
import {BasicTransactionParams} from './common'

interface SendBasicTransactionProps {
  onSend: () => void
  availableAmount: Wei
  estimateTransactionFee: () => Promise<FeeEstimates>
  transactionParams: BasicTransactionParams
  setTransactionParams: (basicParams: Partial<BasicTransactionParams>) => void
  onCancel: () => void
}

export const SendBasicTransaction = ({
  estimateTransactionFee,
  availableAmount,
  onCancel,
  onSend,
  transactionParams,
  setTransactionParams,
}: SendBasicTransactionProps & ModalProps): JSX.Element => {
  const {t} = useTranslation()
  const modalLocker = ModalLocker.useContainer()
  const {fee, amount, recipient} = transactionParams

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
          setRecipient={(recipient) => setTransactionParams({recipient})}
          recipient={recipient}
        />
        <DialogInput
          label={t(['wallet', 'label', 'amount'])}
          id="tx-amount"
          onChange={(e): void => setTransactionParams({amount: e.target.value})}
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
          onChange={(fee) => setTransactionParams({fee})}
          errorMessage={translateValidationResult(t, feeValidationResult)}
          isPending={isFeeEstimationPending}
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
