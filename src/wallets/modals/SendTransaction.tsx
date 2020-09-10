import React, {useState, FunctionComponent, useEffect} from 'react'
import BigNumber from 'bignumber.js'
import {ModalProps} from 'antd/lib/modal'
import {Rule} from 'antd/lib/form'
import {ModalLocker, wrapWithModal} from '../../common/LunaModal'
import {Dialog, DialogState} from '../../common/Dialog'
import {DialogInput, DialogInputTextArea} from '../../common/dialog/DialogInput'
import {DialogColumns} from '../../common/dialog/DialogColumns'
import {
  validateFee,
  createTxAmountValidator,
  createConfidentialAddressValidator,
  createTransparentAddressValidator,
  translateValidationResult,
  validateUtf8Length,
  toAntValidator,
} from '../../common/util'
import {UNITS} from '../../common/units'
import {DialogShowAmount} from '../../common/dialog/DialogShowAmount'
import {DialogTextSwitch} from '../../common/dialog/DialogTextSwitch'
import {DialogFee} from '../../common/dialog/DialogFee'
import {FeeEstimates} from '../../common/wallet-state'
import {useAsyncUpdate} from '../../common/hook-utils'
import {BackendState, getNetworkTagOrTestnet} from '../../common/backend-state'
import {useTranslation} from '../../settings-state'
import {Trans} from '../../common/Trans'
import './SendTransaction.scss'

const {Ether} = UNITS

const MAX_MEMO_LENGTH_IN_BYTES = 512
const RECIPIENT_FIELD = 'recipient-address'

type Mode = 'transparent' | 'confidential'

interface SendTransactionProps {
  availableAmount: BigNumber
  onSendToConfidential: (
    recipient: string,
    amount: number,
    fee: number,
    memo: string,
  ) => Promise<void>
  onSendToTransparent: (recipient: string, amount: BigNumber, fee: BigNumber) => Promise<void>
  estimatePrivateTransactionFee: (amount: BigNumber) => Promise<FeeEstimates>
  estimatePublicTransactionFee: (amount: BigNumber, recipient: string) => Promise<FeeEstimates>
  defaultMode?: Mode
}

const AddressField = ({
  addressValidator,
  setRecipient,
  mode,
}: {
  addressValidator: Rule
  setRecipient: (recipient: string) => void
  mode: Mode
}): JSX.Element => {
  const {t} = useTranslation()
  const {dialogForm} = DialogState.useContainer()

  useEffect(() => {
    if (dialogForm.isFieldTouched(RECIPIENT_FIELD)) {
      dialogForm.validateFields([RECIPIENT_FIELD])
    }
  }, [mode])

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
  onSendToTransparent,
  estimatePrivateTransactionFee,
  estimatePublicTransactionFee,
  defaultMode = 'confidential',
  onCancel,
}: SendTransactionProps & ModalProps) => {
  const {networkTag: optionalNetworkTag} = BackendState.useContainer()
  const networkTag = getNetworkTagOrTestnet(optionalNetworkTag)
  const {t} = useTranslation()
  const modalLocker = ModalLocker.useContainer()

  const [mode, setMode] = useState(defaultMode)

  const [amount, setAmount] = useState('0')
  const [fee, setFee] = useState('0')
  const [recipient, setRecipient] = useState('')
  const [memo, setMemo] = useState('')

  const {title, rawAddressValidator, estimateTransactionFee, onSend} =
    mode === 'confidential'
      ? {
          title: t(['wallet', 'title', 'sendFromConfidentialToConfidential']),
          rawAddressValidator: createConfidentialAddressValidator(networkTag),
          estimateTransactionFee: (): Promise<FeeEstimates> =>
            estimatePrivateTransactionFee(Ether.toBasic(new BigNumber(amount))),
          onSend: (): Promise<void> =>
            onSendToConfidential(
              recipient,
              Number(Ether.toBasic(amount)),
              Number(Ether.toBasic(fee)),
              memo,
            ),
        }
      : {
          title: t(['wallet', 'title', 'sendFromConfidentialToTransparent']),
          rawAddressValidator: createTransparentAddressValidator(networkTag),
          estimateTransactionFee: (): Promise<FeeEstimates> =>
            estimatePublicTransactionFee(Ether.toBasic(new BigNumber(amount)), recipient),
          onSend: (): Promise<void> =>
            onSendToTransparent(
              recipient,
              new BigNumber(Ether.toBasic(amount)),
              new BigNumber(Ether.toBasic(fee)),
            ),
        }

  const feeValidationResult = validateFee(fee)
  const txAmountValidator = createTxAmountValidator(t, availableAmount)
  const addressValidator = toAntValidator(t, rawAddressValidator)
  const memoValidator = toAntValidator(t, validateUtf8Length(MAX_MEMO_LENGTH_IN_BYTES))

  const [feeEstimates, feeEstimateError, isFeeEstimationPending] = useAsyncUpdate(
    estimateTransactionFee,
    [amount, recipient, networkTag, mode],
    async (): Promise<void> => {
      if (amount !== '0') {
        await txAmountValidator.validator({}, amount)
      }
      if (recipient !== '' && mode === 'transparent') {
        await addressValidator.validator({}, recipient)
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
        title={title}
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
        <DialogTextSwitch
          label={t(['wallet', 'label', 'transactionTypeLong'])}
          defaultMode={mode}
          buttonClassName="mode-switch"
          left={{label: t(['wallet', 'transactionType', 'transparent']), type: 'transparent'}}
          right={{label: t(['wallet', 'transactionType', 'confidential']), type: 'confidential'}}
          disabled={modalLocker.isLocked}
          onChange={setMode}
        />
        <AddressField addressValidator={addressValidator} setRecipient={setRecipient} mode={mode} />
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
        {mode === 'confidential' && (
          <DialogInputTextArea
            label={t(['wallet', 'label', 'encryptedMemo'])}
            optional
            id="encrypted-memo"
            onChange={(e): void => setMemo(e.target.value)}
            autoSize
            formItem={{
              name: 'encrypted-memo',
              initialValue: memo,
              rules: [memoValidator],
            }}
          />
        )}
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
