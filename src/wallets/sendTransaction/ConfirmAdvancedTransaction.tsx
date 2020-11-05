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
import {AdvancedTransactionParams} from './common'

interface ConfirmAdvancedTransactionProps {
  onClose: () => void
  transactionParams: AdvancedTransactionParams
  onCancel: () => void
}

const _ConfirmAdvancedTransaction = ({
  transactionParams,
  onCancel,
  onClose,
  walletState,
}: PropsWithWalletState<
  ConfirmAdvancedTransactionProps & ModalProps,
  LoadedState
>): JSX.Element => {
  const {sendTransaction} = walletState
  const {t} = useTranslation()
  const modalLocker = ModalLocker.useContainer()

  const {recipient, amount, gasLimit, gasPrice, data, nonce} = transactionParams
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
            sendTransaction({
              recipient,
              gasLimit: parseInt(gasLimit),
              gasPrice: asEther(gasPrice),
              data,
              nonce: parseInt(nonce),
              password,
              amount: asEther(amount),
            })
            onClose()
          },
        }}
        onSetLoading={modalLocker.setLocked}
        type="dark"
      >
        <DialogInput value={recipient} label="Recipient" disabled={true} />
        <DialogShowAmount amount={asEther(amount)} displayExact>
          Amount
        </DialogShowAmount>
        <DialogInput value={gasLimit} label="Gas Limit" disabled={true} />
        <DialogInput value={gasPrice} label="Gas Price" disabled={true} />
        <DialogInput value={nonce} label="Nonce" disabled={true} />
        <DialogInput value={data} label="Data" disabled={true} />
        <DialogInput value={nonce} label="Nonce" disabled={true} />
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

export const ConfirmAdvancedTransaction = withStatusGuard(_ConfirmAdvancedTransaction, 'LOADED')
