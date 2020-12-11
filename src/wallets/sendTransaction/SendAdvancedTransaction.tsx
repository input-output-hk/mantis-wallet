import React, {useState, useEffect} from 'react'
import {ModalProps} from 'antd/lib/modal'
import BigNumber from 'bignumber.js'
import {ModalLocker} from '../../common/MantisModal'
import {Dialog} from '../../common/Dialog'
import {DialogInput, DialogTextArea} from '../../common/dialog/DialogInput'
import {DialogColumns} from '../../common/dialog/DialogColumns'
import {DialogAddressSelect} from '../../address-book/DialogAddressSelect'
import {FeeEstimates, LoadedState} from '../../common/wallet-state'
import {useTranslation} from '../../settings-state'
import {AdvancedTransactionParams} from './common'
import {
  createAdvancedTxAmountValidator,
  createGasAmountValidator,
  createFeeValidator,
  createHexValidator,
  toAntValidator,
  validateAddressOrEmpty,
} from '../../common/util'
import {PropsWithWalletState, withStatusGuard} from '../../common/wallet-status-guard'
import {getSendTransactionParams} from './ConfirmAdvancedTransaction'
import {asEther, asWei, Wei} from '../../common/units'
import {rendererLog} from '../../common/logger'

interface SendAdvancedTransactionProps {
  onSend: () => void
  availableAmount: Wei
  transactionParams: AdvancedTransactionParams
  setTransactionParams: (advancedParams: Partial<AdvancedTransactionParams>) => void
  estimateTransactionFee: () => Promise<FeeEstimates>
  onCancel: () => void
}

const _SendAdvancedTransaction = ({
  availableAmount,
  transactionParams,
  setTransactionParams,
  onCancel,
  onSend,
  walletState,
}: PropsWithWalletState<SendAdvancedTransactionProps & ModalProps, LoadedState>): JSX.Element => {
  const {t} = useTranslation()
  const modalLocker = ModalLocker.useContainer()
  const {estimateGas} = walletState

  const {amount, recipient, gasLimit, gasPrice, data, nonce} = transactionParams

  const [gasEstimate, setGasEstimate] = useState<undefined | number>(undefined)

  useEffect(() => {
    async function doGasEstimate(): Promise<void> {
      try {
        const estimatedGas = await estimateGas(getSendTransactionParams(transactionParams))
        setGasEstimate(estimatedGas)
      } catch (e) {
        rendererLog.error(e)
        setGasEstimate(undefined)
      }
    }
    doGasEstimate()
  }, [transactionParams])

  const addressValidator = toAntValidator(t, validateAddressOrEmpty)
  const txAmountValidator = createAdvancedTxAmountValidator(t)
  const gasAmountValidator = createGasAmountValidator(t)
  const feeValidator = createFeeValidator(t)
  const hexValidator = createHexValidator(t)

  const feeLimit = new BigNumber(gasLimit).times(gasPrice)
  const totalAmount = asEther(new BigNumber(amount).plus(feeLimit))

  const remainingBalance = asWei(
    totalAmount.isFinite() ? availableAmount.minus(totalAmount) : availableAmount,
  )

  const disableSend = remainingBalance.isNegative()

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
          disabled: disableSend,
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
            label="Estimated gas amount"
            id="tx-gas-estimate"
            value={gasEstimate}
            disabled={true}
          />
        </DialogColumns>
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

export const SendAdvancedTransaction = withStatusGuard(_SendAdvancedTransaction, 'LOADED')
