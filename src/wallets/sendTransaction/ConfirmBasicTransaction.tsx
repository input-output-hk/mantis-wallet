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
import {InlineError} from '../../common/InlineError'

interface ConfirmBasicTransactionProps {
  onClose: () => void
  transactionParams: BasicTransactionParams
  onCancel: () => void
}

const _ConfirmBasicTransaction = ({
  transactionParams,
  onCancel,
  onClose,
  walletState,
}: PropsWithWalletState<ConfirmBasicTransactionProps & ModalProps, LoadedState>): JSX.Element => {
  const {doTransfer} = walletState
  const {t} = useTranslation()
  const modalLocker = ModalLocker.useContainer()

  const {recipient, amount, fee} = transactionParams
  const [password, setPassword] = useState('')
  const [error, setError] = useState<undefined | string>(undefined)

  const tryDoTransfer = async (): Promise<void> => {
    try {
      await doTransfer(recipient, asEther(amount), asEther(fee), password)
      setError(undefined)
      onClose()
    } catch (e) {
      setError(String(e))
    }
  }

  return (
    <>
      <Dialog
        title={t(['wallet', 'title', 'send'])}
        leftButtonProps={{
          children: t(['wallet', 'button', 'back']),
          onClick: onCancel,
          disabled: modalLocker.isLocked,
        }}
        rightButtonProps={{
          children: t(['wallet', 'button', 'confirm']),
          onClick: tryDoTransfer,
        }}
        onSetLoading={modalLocker.setLocked}
        type="dark"
      >
        <DialogInput value={recipient} label="Recipient" disabled={true} />
        <DialogShowAmount amount={asEther(amount)} displayExact>
          {t(['wallet', 'label', 'amount'])}
        </DialogShowAmount>

        <DialogShowAmount amount={asEther(fee)} displayExact>
          {t(['wallet', 'label', 'transactionFee'])}
        </DialogShowAmount>

        <DialogInputPassword
          autoFocus
          label={t(['wallet', 'label', 'password'])}
          id="tx-password"
          onChange={(e): void => setPassword(e.target.value)}
          formItem={{
            name: 'tx-password',
            initialValue: password,
            rules: [{required: true, message: t(['wallet', 'error', 'passwordMustBeProvided'])}],
          }}
        />
        {error !== undefined && <InlineError errorMessage={error} />}
      </Dialog>
    </>
  )
}

export const ConfirmBasicTransaction = withStatusGuard(_ConfirmBasicTransaction, 'LOADED')
