import React, {useState} from 'react'
import BigNumber from 'bignumber.js'
import {TransparentAccount, FeeEstimates} from '../../common/wallet-state'
import {ModalLocker, wrapWithModal, ModalOnCancel} from '../../common/LunaModal'
import {Dialog} from '../../common/Dialog'
import {DialogInput} from '../../common/dialog/DialogInput'
import {validateFee, createTxAmountValidator} from '../../common/util'
import {DialogShowDust} from '../../common/dialog/DialogShowDust'
import {UNITS} from '../../common/units'
import {DialogMessage} from '../../common/dialog/DialogMessage'
import {useAsyncUpdate} from '../../common/hook-utils'
import {DialogError} from '../../common/dialog/DialogError'
import {DialogFee} from '../../common/dialog/DialogFee'
import {COULD_NOT_UPDATE_FEE_ESTIMATES} from './tx-strings'

const {Dust} = UNITS

interface RedeemDialogProps extends ModalOnCancel {
  transparentAccount: TransparentAccount
  redeem: (address: string, amount: number, fee: number) => Promise<void>
  estimateRedeemFee: (amount: BigNumber) => Promise<FeeEstimates>
}

const RedeemDialog: React.FunctionComponent<RedeemDialogProps> = ({
  transparentAccount,
  redeem,
  estimateRedeemFee,
  onCancel,
}: RedeemDialogProps) => {
  const [amount, setAmount] = useState('0')
  const [fee, setFee] = useState('0')
  const modalLocker = ModalLocker.useContainer()

  const feeError = validateFee(fee)
  const txAmountValidator = createTxAmountValidator(transparentAccount.balance)

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
      <DialogMessage
        description="This transaction will move selected funds to a confidential address which will remove their visibility from the Midnight Blockchain."
        type="highlight"
      />
    </Dialog>
  )
}

export const RedeemModal = wrapWithModal(RedeemDialog)
