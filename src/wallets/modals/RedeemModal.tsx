import React, {useState} from 'react'
import {TransparentAccount} from '../../common/wallet-state'
import {ModalLocker, wrapWithModal, ModalOnCancel} from '../../common/LunaModal'
import {Dialog} from '../../common/Dialog'
import {DialogColumns} from '../../common/dialog/DialogColumns'
import {DialogInput} from '../../common/dialog/DialogInput'
import {validateAmount} from '../../common/util'
import {DialogShowDust} from '../../common/dialog/DialogShowDust'
import {UNITS} from '../../common/units'
import {DialogMessage} from '../../common/dialog/DialogMessage'

const {Dust} = UNITS

interface RedeemDialogProps extends ModalOnCancel {
  transparentAccount: TransparentAccount
  redeem: (address: string, amount: number, fee: number) => Promise<void>
}

const RedeemDialog: React.FunctionComponent<RedeemDialogProps> = ({
  transparentAccount,
  redeem,
  onCancel,
}: RedeemDialogProps) => {
  const [amount, setAmount] = useState('0')
  const [fee, setFee] = useState('0')
  const modalLocker = ModalLocker.useContainer()

  const feeError = validateAmount(fee)
  const amountError = validateAmount(amount)
  const disableRedeem = !!feeError || !!amountError

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
      type="dark"
    >
      <DialogShowDust amount={transparentAccount.balance}>Available Amount</DialogShowDust>
      <DialogColumns>
        <DialogInput
          label="Fee"
          defaultValue={fee}
          onChange={(e): void => setFee(e.target.value)}
          errorMessage={feeError}
        />
        <DialogInput
          label="Amount"
          defaultValue={amount}
          onChange={(e): void => setAmount(e.target.value)}
          errorMessage={amountError}
        />
      </DialogColumns>
      <DialogMessage
        description="This transaction will move selected funds to a confidential address which will remove their visibility from the Midnight Blockchain."
        type="highlight"
      />
    </Dialog>
  )
}

export const RedeemModal = wrapWithModal(RedeemDialog)
