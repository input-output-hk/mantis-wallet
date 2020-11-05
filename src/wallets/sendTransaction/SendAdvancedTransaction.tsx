import React, {FunctionComponent} from 'react'
import {ModalProps} from 'antd/lib/modal'
import {ModalLocker} from '../../common/MantisModal'
import {Dialog} from '../../common/Dialog'
import {DialogInput} from '../../common/dialog/DialogInput'
import {DialogColumns} from '../../common/dialog/DialogColumns'
import {Wei} from '../../common/units'
import {DialogAddressSelect} from '../../address-book/DialogAddressSelect'
import {FeeEstimates} from '../../common/wallet-state'
import {useTranslation} from '../../settings-state'
import {AdvancedTransactionParams} from './common'

interface SendAdvancedTransactionProps {
  onSend: () => void
  availableAmount: Wei
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

  const {amount, recipient} = transactionParams

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
          onClick: onSend,
        }}
        onSetLoading={modalLocker.setLocked}
        type="dark"
      >
        <DialogAddressSelect
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
          }}
        />
        <DialogColumns>
          <DialogInput
            label="Maximum Gas amount"
            id="tx-gas-amount"
            onChange={(e): void => setTransactionParams({gasLimit: e.target.value})}
            formItem={{
              name: 'tx-gas-amount',
              initialValue: '',
            }}
          />
          <DialogInput
            label="Gas Price"
            id="tx-gas-price"
            onChange={(e): void => setTransactionParams({gasPrice: e.target.value})}
            formItem={{
              name: 'tx-gas-price',
              initialValue: '',
            }}
          />
        </DialogColumns>
        <DialogInput
          label="Data"
          id="tx-data"
          onChange={(e): void => setTransactionParams({data: e.target.value})}
          formItem={{
            name: 'tx-data',
            initialValue: '',
          }}
        />
        <DialogInput
          label="Nonce"
          id="tx-nonce"
          onChange={(e): void => setTransactionParams({nonce: e.target.value})}
          formItem={{
            name: 'tx-nonce',
            initialValue: '',
          }}
        />
      </Dialog>
    </>
  )
}
