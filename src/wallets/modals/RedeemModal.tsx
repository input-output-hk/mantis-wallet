import React, {useState, useEffect, FunctionComponent} from 'react'
import BigNumber from 'bignumber.js'
import classnames from 'classnames'
import {Button} from 'antd'
import {TransparentAccount, FeeEstimates} from '../../common/wallet-state'
import {ModalLocker, wrapWithModal, ModalOnCancel} from '../../common/LunaModal'
import {Dialog, DialogState} from '../../common/Dialog'
import {DialogInput} from '../../common/dialog/DialogInput'
import {validateFee, createTxAmountValidator, translateValidationResult} from '../../common/util'
import {DialogShowDust} from '../../common/dialog/DialogShowDust'
import {UNITS} from '../../common/units'
import {DialogMessage} from '../../common/dialog/DialogMessage'
import {useAsyncUpdate} from '../../common/hook-utils'
import {DialogFee} from '../../common/dialog/DialogFee'
import {useTranslation} from '../../settings-state'
import {Trans} from '../../common/Trans'
import {DialogColumns} from '../../common/dialog/DialogColumns'
import './RedeemModal.scss'

const {Dust} = UNITS

interface RedeemDialogProps extends ModalOnCancel {
  transparentAccount: TransparentAccount
  redeem: (address: string, amount: number, fee: number) => Promise<void>
  estimateRedeemFee: (amount: BigNumber) => Promise<FeeEstimates>
}

const TX_AMOUNT_FIELD = 'redeem-tx-amount'

const AmountInput = ({
  value,
  onChange,
  txAmountValidator,
}: {
  value: string
  onChange: (amount: string) => void
  txAmountValidator: ReturnType<typeof createTxAmountValidator>
}): JSX.Element => {
  const {dialogForm, setErrorMessage} = DialogState.useContainer()
  const [_value, setValue] = useState(value)

  useEffect(() => {
    if (value !== _value) {
      dialogForm.setFieldsValue({[TX_AMOUNT_FIELD]: value})
      dialogForm.validateFields([TX_AMOUNT_FIELD])
      setErrorMessage('')
      setValue(value)
    }
  }, [value])

  return (
    <DialogInput
      data-testid={TX_AMOUNT_FIELD}
      onChange={(e): void => {
        setValue(e.target.value)
        onChange(e.target.value)
      }}
      formItem={{
        name: TX_AMOUNT_FIELD,
        initialValue: value,
        rules: [txAmountValidator],
      }}
    />
  )
}

const RedeemDialog: FunctionComponent<RedeemDialogProps> = ({
  transparentAccount,
  redeem,
  estimateRedeemFee,
  onCancel,
}: RedeemDialogProps) => {
  const {t} = useTranslation()
  const modalLocker = ModalLocker.useContainer()

  const [amount, setAmount] = useState('0')
  const [fee, setFee] = useState('0')
  const [useFullAmount, setUseFullAmount] = useState(false)

  const feeValidationResult = validateFee(fee)
  const txAmountValidator = createTxAmountValidator(t, transparentAccount.balance)

  useEffect(() => {
    if (useFullAmount) {
      const bigNumberFee = new BigNumber(fee)
      const balance = Dust.fromBasic(transparentAccount.balance)
      setAmount(
        balance.minus(bigNumberFee.isPositive() ? bigNumberFee : new BigNumber(0)).toString(10),
      )
    }
  }, [fee, transparentAccount, useFullAmount])

  const [feeEstimates, feeEstimateError, isFeeEstimationPending] = useAsyncUpdate(
    (): Promise<FeeEstimates> => estimateRedeemFee(Dust.toBasic(new BigNumber(amount))),
    [amount],
    () => (amount === '0' ? Promise.resolve() : txAmountValidator.validator({}, amount)),
  )

  const totalAmount = new BigNumber(Dust.toBasic(amount)).plus(new BigNumber(Dust.toBasic(fee)))
  const remainingBalance = totalAmount.isFinite()
    ? transparentAccount.balance.minus(totalAmount)
    : transparentAccount.balance

  const disableRedeem =
    feeValidationResult !== 'OK' || !feeEstimates || !remainingBalance.isPositive()

  return (
    <Dialog
      title={t(['wallet', 'title', 'sendFromTransparentToConfidential'])}
      leftButtonProps={{
        onClick: onCancel,
      }}
      rightButtonProps={{
        children: t(['wallet', 'button', 'applyConfidentialityShort']),
        onClick: async (): Promise<void> => {
          await redeem(
            transparentAccount.address,
            Number(Dust.toBasic(amount)),
            Number(Dust.toBasic(fee)),
          )
        },
        disabled: disableRedeem,
      }}
      onSetLoading={modalLocker.setLocked}
      type="dark"
    >
      <div className="amount-container">
        <div className="label">
          <Trans k={['wallet', 'label', 'amount']} />
        </div>
        <Button
          data-testid="full-amount"
          className={classnames('full-amount', {inactive: !useFullAmount})}
          onClick={() => {
            setUseFullAmount(!useFullAmount)
          }}
        >
          <Trans k={['wallet', 'button', 'useFullAmount']} />
        </Button>
        <AmountInput
          onChange={(amount) => {
            setUseFullAmount(false)
            setAmount(amount)
          }}
          value={amount}
          txAmountValidator={txAmountValidator}
        />
      </div>
      <DialogFee
        label={t(['wallet', 'label', 'transactionFee'])}
        feeEstimates={feeEstimates}
        feeEstimateError={feeEstimateError}
        defaultValue={fee}
        onChange={(fee: string): void => setFee(fee)}
        isPending={isFeeEstimationPending}
        errorMessage={translateValidationResult(t, feeValidationResult)}
        forceCustom={useFullAmount}
      />
      <DialogMessage type="highlight">
        <Trans k={['wallet', 'message', 'applyConfidentialityDescription']} />
      </DialogMessage>
      <DialogColumns>
        <DialogShowDust amount={totalAmount} displayExact>
          <Trans k={['wallet', 'label', 'totalTransactionAmount']} />
        </DialogShowDust>
        <DialogShowDust amount={remainingBalance} displayExact>
          <Trans k={['wallet', 'label', 'remainingBalance']} />
        </DialogShowDust>
      </DialogColumns>
    </Dialog>
  )
}

export const RedeemModal = wrapWithModal(RedeemDialog, 'RedeemModal')
