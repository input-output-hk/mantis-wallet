import React, {useState} from 'react'
import {ModalProps} from 'antd/lib/modal'
import {pipe} from 'fp-ts/lib/function'
import {ModalLocker} from '../../common/MantisModal'
import {Dialog} from '../../common/Dialog'
import {DialogInput, DialogInputPassword} from '../../common/dialog/DialogInput'
import {asEther} from '../../common/units'
import {DialogShowAmount} from '../../common/dialog/DialogShowAmount'
import {LoadedState, SendTransactionParams} from '../../common/wallet-state'
import {useTranslation} from '../../settings-state'
import {withStatusGuard, PropsWithWalletState} from '../../common/wallet-status-guard'
import {AdvancedTransactionParams} from './common'
import {InlineError} from '../../common/InlineError'

export const getSendTransactionParams = (
  params: AdvancedTransactionParams,
): Omit<SendTransactionParams, 'password'> => {
  const {recipient, amount, gasLimit, gasPrice, data, nonce} = params
  return {
    recipient,
    gasLimit: parseInt(gasLimit),
    gasPrice: asEther(gasPrice),
    data,
    nonce: parseInt(nonce),
    amount: pipe(amount, (amount) => (amount.length === 0 ? '0' : amount), asEther),
  }
}

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
  const {t, translateError} = useTranslation()
  const modalLocker = ModalLocker.useContainer()

  const {recipient, amount, gasLimit, gasPrice, data, nonce} = transactionParams
  const [password, setPassword] = useState('')
  const [error, setError] = useState<undefined | Error>(undefined)

  const trySendTransaction = async (): Promise<void> => {
    try {
      await sendTransaction({
        ...getSendTransactionParams(transactionParams),
        password,
      })
      setError(undefined)
      onClose()
    } catch (e) {
      setError(e)
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
          onClick: trySendTransaction,
        }}
        onSetLoading={modalLocker.setLocked}
        type="dark"
      >
        <DialogInput
          value={recipient}
          label={t(['wallet', 'label', 'recipient'])}
          disabled={true}
        />
        <DialogShowAmount amount={asEther(amount)} displayExact>
          {t(['wallet', 'label', 'amount'])}
        </DialogShowAmount>
        <DialogInput value={gasLimit} label={t(['wallet', 'label', 'gasLimit'])} disabled={true} />
        <DialogInput value={gasPrice} label={t(['wallet', 'label', 'gasPrice'])} disabled={true} />
        <DialogInput value={nonce} label={t(['wallet', 'label', 'nonce'])} disabled={true} />
        <DialogInput value={data} label={t(['wallet', 'label', 'data'])} disabled={true} />
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
        {error !== undefined && <InlineError errorMessage={translateError(error)} />}
      </Dialog>
    </>
  )
}

export const ConfirmAdvancedTransaction = withStatusGuard(_ConfirmAdvancedTransaction, 'LOADED')
