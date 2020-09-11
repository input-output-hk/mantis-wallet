import React, {useState, FunctionComponent} from 'react'
import BigNumber from 'bignumber.js'
import {ModalProps} from 'antd/lib/modal'
import {Rule} from 'antd/lib/form'
import {ModalLocker, wrapWithModal} from '../../common/LunaModal'
import {Dialog} from '../../common/Dialog'
import {DialogInput} from '../../common/dialog/DialogInput'
import {DialogColumns} from '../../common/dialog/DialogColumns'
import {
  validateFee,
  createTxAmountValidator,
  createConfidentialAddressValidator,
  translateValidationResult,
  toAntValidator,
} from '../../common/util'
import {UNITS} from '../../common/units'
import {DialogShowAmount} from '../../common/dialog/DialogShowAmount'
import {DialogFee} from '../../common/dialog/DialogFee'
import {FeeEstimates} from '../../common/wallet-state'
import {useAsyncUpdate} from '../../common/hook-utils'
import {BackendState, getNetworkTagOrTestnet} from '../../common/backend-state'
import {useTranslation} from '../../settings-state'
import {Trans} from '../../common/Trans'
import './SendTransaction.scss'

const {Ether} = UNITS

const RECIPIENT_FIELD = 'recipient-address'

interface SendTransactionProps {
  availableAmount: BigNumber
  onSendToConfidential: (recipient: string, amount: number, fee: number) => Promise<void>
  estimatePrivateTransactionFee: (amount: BigNumber) => Promise<FeeEstimates>
}

const AddressField = ({
  addressValidator,
  setRecipient,
}: {
  addressValidator: Rule
  setRecipient: (recipient: string) => void
}): JSX.Element => {
  const {t} = useTranslation()

  return (
    <DialogInput
      label={t(['wallet', 'label', 'recipient'])}
      id={RECIPIENT_FIELD}
      onChange={(e): void => setRecipient(e.target.value)}
      formItem={{
        name: RECIPIENT_FIELD,
        rules: [
          {required: true, message: t(['wallet', 'error', 'recipientMustBe'])},
          addressValidator,
        ],
      }}
    />
  )
}

export const _SendTransaction: FunctionComponent<SendTransactionProps & ModalProps> = ({
  availableAmount,
  onSendToConfidential,
  estimatePrivateTransactionFee,
  onCancel,
}: SendTransactionProps & ModalProps) => {
  const {networkTag: optionalNetworkTag} = BackendState.useContainer()
  const networkTag = getNetworkTagOrTestnet(optionalNetworkTag)
  const {t} = useTranslation()
  const modalLocker = ModalLocker.useContainer()

  const [amount, setAmount] = useState('0')
  const [fee, setFee] = useState('0')
  const [recipient, setRecipient] = useState('')

  const rawAddressValidator = createConfidentialAddressValidator(networkTag)
  const estimateTransactionFee = (): Promise<FeeEstimates> =>
    estimatePrivateTransactionFee(Ether.toBasic(new BigNumber(amount)))
  const onSend = (): Promise<void> =>
    onSendToConfidential(recipient, Number(Ether.toBasic(amount)), Number(Ether.toBasic(fee)))

  const feeValidationResult = validateFee(fee)
  const txAmountValidator = createTxAmountValidator(t, availableAmount)
  const addressValidator = toAntValidator(t, rawAddressValidator)

  const [feeEstimates, feeEstimateError, isFeeEstimationPending] = useAsyncUpdate(
    estimateTransactionFee,
    [amount, recipient, networkTag],
    async (): Promise<void> => {
      if (amount !== '0') {
        await txAmountValidator.validator({}, amount)
      }
    },
  )

  const totalAmount = new BigNumber(Ether.toBasic(amount)).plus(new BigNumber(Ether.toBasic(fee)))
  const remainingBalance = totalAmount.isFinite()
    ? availableAmount.minus(totalAmount)
    : availableAmount

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
        <AddressField addressValidator={addressValidator} setRecipient={setRecipient} />
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
