import React, {FunctionComponent} from 'react'
import {ModalProps} from 'antd/lib/modal'
import {ModalLocker} from '../../common/MantisModal'
import {Dialog} from '../../common/Dialog'
import {DialogInput, DialogTextArea} from '../../common/dialog/DialogInput'
import {DialogColumns} from '../../common/dialog/DialogColumns'
import {DialogAddressSelect} from '../../address-book/DialogAddressSelect'
import {FeeEstimates} from '../../common/store/wallet'
import {useTranslation} from '../../common/store/settings'
import {AdvancedTransactionParams} from './common'
import {
  createAdvancedTxAmountValidator,
  createGasAmountValidator,
  createFeeValidator,
  createHexValidator,
  toAntValidator,
  validateAddressOrEmpty,
} from '../../common/util'

interface SendAdvancedTransactionProps {
  onSend: () => void
  transactionParams: AdvancedTransactionParams
  setTransactionParams: (advancedParams: Partial<AdvancedTransactionParams>) => void
  estimateTransactionFee: () => Promise<FeeEstimates>
  onCancel: () => void
}

export const SendAdvancedTransaction: FunctionComponent<SendAdvancedTransactionProps &
  ModalProps> = ({
  transactionParams,
  setTransactionParams,
  onCancel,
  onSend,
}: SendAdvancedTransactionProps & ModalProps) => {
  const {t} = useTranslation()
  const modalLocker = ModalLocker.useContainer()

  const {amount, recipient, gasLimit, gasPrice, data, nonce} = transactionParams

  const addressValidator = toAntValidator(t, validateAddressOrEmpty)
  const txAmountValidator = createAdvancedTxAmountValidator(t)
  const gasAmountValidator = createGasAmountValidator(t)
  const feeValidator = createFeeValidator(t)
  const hexValidator = createHexValidator(t)

  return (
    <>
      <Dialog
        title={t(['wallet', 'title', 'send'])}
        leftButtonProps={{
          onClick: onCancel,
          disabled: modalLocker.isLocked,
        }}
        rightButtonProps={{
          children: t(['wallet', 'button', 'sendTransaction']),
          onClick: () => {
            if (amount.length === 0) {
              setTransactionParams({amount: '0'})
            }
            onSend()
          },
        }}
        onSetLoading={modalLocker.setLocked}
        type="dark"
      >
        <DialogAddressSelect
          addressValidator={addressValidator}
          setRecipient={(recipient) => setTransactionParams({recipient})}
          recipient={recipient}
        />
        <DialogInput
          label={t(['wallet', 'label', 'amount'])}
          id="tx-amount"
          onChange={(e): void => setTransactionParams({amount: e.target.value})}
          formItem={{
            name: 'tx-amount',
            initialValue: amount,
            rules: [txAmountValidator],
          }}
        />
        <DialogColumns>
          <DialogInput
            label={t(['wallet', 'label', 'gasLimit'])}
            id="tx-gas-limit"
            onChange={(e): void => setTransactionParams({gasLimit: e.target.value})}
            formItem={{
              name: 'tx-gas-limit',
              initialValue: gasLimit,
              rules: [gasAmountValidator],
            }}
          />
          <DialogInput
            label={t(['wallet', 'label', 'gasPrice'])}
            id="tx-gas-price"
            onChange={(e): void => setTransactionParams({gasPrice: e.target.value})}
            formItem={{
              name: 'tx-gas-price',
              initialValue: gasPrice,
              rules: [feeValidator],
            }}
          />
        </DialogColumns>
        <DialogTextArea
          label={t(['wallet', 'label', 'data'])}
          id="tx-data"
          onChange={(e): void => setTransactionParams({data: e.target.value})}
          formItem={{
            name: 'tx-data',
            initialValue: data,
            rules: [hexValidator],
          }}
        />
        <DialogInput
          label={t(['wallet', 'label', 'nonce'])}
          id="tx-nonce"
          onChange={(e): void => setTransactionParams({nonce: e.target.value})}
          formItem={{
            name: 'tx-nonce',
            initialValue: nonce,
            rules: [gasAmountValidator],
          }}
        />
      </Dialog>
    </>
  )
}
