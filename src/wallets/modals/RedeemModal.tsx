import React, {useState} from 'react'
import BigNumber from 'bignumber.js'
import {TransparentAccount, FeeEstimates} from '../../common/wallet-state'
import {ModalLocker, wrapWithModal, ModalOnCancel} from '../../common/LunaModal'
import {Dialog} from '../../common/Dialog'
import {DialogInput} from '../../common/dialog/DialogInput'
import {validateTxAmount, validateFee} from '../../common/util'
import {DialogShowDust} from '../../common/dialog/DialogShowDust'
import {UNITS} from '../../common/units'
import {DialogMessage} from '../../common/dialog/DialogMessage'
import {useAsyncUpdate} from '../../common/hook-utils'
import {DialogError} from '../../common/dialog/DialogError'
import {DialogFee} from '../../common/dialog/DialogFee'
import {INVALID_AMOUNT_FOR_FEE_ESTIMATION, COULD_NOT_UPDATE_FEE_ESTIMATES} from './tx-strings'

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
  const amountError = validateTxAmount(amount, transparentAccount.balance)

  const [feeEstimates, feeEstimateError, isPending] = useAsyncUpdate((): Promise<FeeEstimates> => {
    // let's provide some default for zero amount
    if (amountError === '' || amount === '0') {
      return estimateRedeemFee(Dust.toBasic(new BigNumber(amount)))
    } else {
      return Promise.reject(INVALID_AMOUNT_FOR_FEE_ESTIMATION)
    }
  }, [amount])

  const disableRedeem = !!feeError || !!amountError || isPending

  // FIXME PM-2050 Fix error handling when amount is too big to estimate
  const footer =
    !feeEstimates ||
    feeEstimateError == null ||
    feeEstimateError === INVALID_AMOUNT_FOR_FEE_ESTIMATION ? (
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
        defaultValue={amount}
        onChange={(e): void => setAmount(e.target.value)}
        errorMessage={amountError}
      />
      <DialogFee
        label="Fee"
        feeEstimates={feeEstimates}
        defaultValue={fee}
        onChange={(fee: string): void => setFee(fee)}
        isPending={isPending}
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
