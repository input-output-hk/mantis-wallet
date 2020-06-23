import React, {useState, useEffect} from 'react'
import BigNumber from 'bignumber.js'
import classnames from 'classnames'
import {Button} from 'antd'
import {TransparentAccount, FeeEstimates} from '../../common/wallet-state'
import {ModalLocker, wrapWithModal, ModalOnCancel} from '../../common/LunaModal'
import {Dialog, DialogState} from '../../common/Dialog'
import {DialogInput} from '../../common/dialog/DialogInput'
import {validateFee, createTxAmountValidator} from '../../common/util'
import {DialogShowDust} from '../../common/dialog/DialogShowDust'
import {UNITS} from '../../common/units'
import {DialogMessage} from '../../common/dialog/DialogMessage'
import {useAsyncUpdate} from '../../common/hook-utils'
import {DialogError} from '../../common/dialog/DialogError'
import {DialogFee} from '../../common/dialog/DialogFee'
import {COULD_NOT_UPDATE_FEE_ESTIMATES} from '../../common/fee-estimate-strings'
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

const RedeemDialog: React.FunctionComponent<RedeemDialogProps> = ({
  transparentAccount,
  redeem,
  estimateRedeemFee,
  onCancel,
}: RedeemDialogProps) => {
  const [amount, setAmount] = useState('0')
  const [fee, setFee] = useState('0')
  const [useFullAmount, setUseFullAmount] = useState(false)
  const modalLocker = ModalLocker.useContainer()

  const feeError = validateFee(fee)
  const txAmountValidator = createTxAmountValidator(transparentAccount.balance)

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

  const disableRedeem = !!feeError || isFeeEstimationPending

  // FIXME PM-2050 Fix error handling when amount is too big to estimate
  const footer =
    !feeEstimates || feeEstimateError == null ? (
      <></>
    ) : (
      <DialogError>{COULD_NOT_UPDATE_FEE_ESTIMATES}</DialogError>
    )

  return (
    <Dialog
      title="Apply Confidentiality"
      leftButtonProps={{
        onClick: onCancel,
      }}
      rightButtonProps={{
        children: 'Apply Confidentiality',
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
      footer={footer}
      type="dark"
    >
      <DialogShowDust amount={transparentAccount.balance}>Available Amount</DialogShowDust>
      <div className="amount-container">
        <div className="label">Amount</div>
        <Button
          data-testid="full-amount"
          className={classnames('full-amount', {inactive: !useFullAmount})}
          onClick={() => {
            setUseFullAmount(!useFullAmount)
          }}
        >
          Full Amount
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
        label="Fee"
        feeEstimates={feeEstimates}
        defaultValue={fee}
        onChange={(fee: string): void => setFee(fee)}
        isPending={isFeeEstimationPending}
        errorMessage={feeError}
        forceCustom={useFullAmount}
      />
      <DialogMessage
        description="This transaction will move selected funds to a confidential address which will remove their visibility from the Midnight Blockchain."
        type="highlight"
      />
    </Dialog>
  )
}

export const RedeemModal = wrapWithModal(RedeemDialog, 'RedeemModal')
