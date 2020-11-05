import React, {useState} from 'react'
import {ModalProps} from 'antd/lib/modal'
import {ModalLocker} from '../../common/MantisModal'
import {Dialog} from '../../common/Dialog'
import {DialogInput, DialogInputPassword} from '../../common/dialog/DialogInput'
import {asEther} from '../../common/units'
import {DialogShowAmount} from '../../common/dialog/DialogShowAmount'
import {LoadedState} from '../../common/wallet-state'
import {useTranslation} from '../../settings-state'
import {withStatusGuard, PropsWithWalletState} from '../../common/wallet-status-guard'
import {BasicTransactionParams} from './common'

interface ConfirmBasicTransactionProps {
  onClose: () => void
  transactionParams: BasicTransactionParams
  onCancel: () => void
}

const _ConfirmBasicTransaction = ({
  transactionParams,
  onCancel,
  walletState,
}: PropsWithWalletState<ConfirmBasicTransactionProps & ModalProps, LoadedState>): JSX.Element => {
  const {doTransfer} = walletState
  const {t} = useTranslation()
  const modalLocker = ModalLocker.useContainer()

  const {recipient, amount, fee} = transactionParams
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
          onClick: (): void => {
            doTransfer(recipient, asEther(amount), asEther(fee), password)
            onCancel()
          },
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

export const ConfirmBasicTransaction = withStatusGuard(_ConfirmBasicTransaction, 'LOADED')
