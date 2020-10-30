import React, {useState, FunctionComponent} from 'react'
import BigNumber from 'bignumber.js'
import {ModalProps} from 'antd/lib/modal'
import {ModalLocker, wrapWithModal} from '../../common/MantisModal'
import {Dialog} from '../../common/Dialog'
import {DialogInput, DialogInputPassword} from '../../common/dialog/DialogInput'
import {DialogColumns} from '../../common/dialog/DialogColumns'
import {
  validateFee,
  createTxAmountValidator,
  validateAddress,
  translateValidationResult,
  toAntValidator,
} from '../../common/util'
import {Wei, asWei, asEther} from '../../common/units'
import {DialogShowAmount} from '../../common/dialog/DialogShowAmount'
import {DialogAddressSelect} from '../../address-book/DialogAddressSelect'
import {DialogFee} from '../../common/dialog/DialogFee'
import {DialogTextSwitch} from '../../common/dialog/DialogTextSwitch'
import {FeeEstimates, LoadedState} from '../../common/wallet-state'
import {useAsyncUpdate} from '../../common/hook-utils'
import {useTranslation} from '../../settings-state'
import {Trans} from '../../common/Trans'
import './SendTransaction.scss'
import {withStatusGuard, PropsWithWalletState} from '../../common/wallet-status-guard'

enum TransactionType {
  basic = 'BASIC',
  advanced = 'ADVANCED',
}

interface BasicTransactionParams {
  amount: string
  fee: string
  recipient: string
}

interface AdvancedTransactionParams {
  amount: string
  gasLimit: string
  gasPrice: string
  recipient: string
  data: string
  nonce: string
}

interface TransactionParams {
  [TransactionType.basic]: BasicTransactionParams
  [TransactionType.advanced]: AdvancedTransactionParams
}

const defaultState: TransactionParams = {
  [TransactionType.basic]: {
    amount: '0',
    fee: '0',
    recipient: '',
  },
  [TransactionType.advanced]: {
    amount: '0',
    gasLimit: '21000',
    gasPrice: '',
    recipient: '',
    data: '',
    nonce: '',
  },
}

interface SendTransactionProps {
  onSend: () => void
  availableAmount: Wei
  estimateTransactionFee: () => Promise<FeeEstimates>
  transactionParams: BasicTransactionParams
  setTransactionParams: (basicParams: Partial<BasicTransactionParams>) => void
  onCancel: () => void
}

const SendTransaction = ({
  estimateTransactionFee,
  availableAmount,
  onCancel,
  onSend,
  transactionParams,
  setTransactionParams,
}: SendTransactionProps & ModalProps): JSX.Element => {
  const {t} = useTranslation()
  const modalLocker = ModalLocker.useContainer()
  const {fee, amount, recipient} = transactionParams

  const addressValidator = toAntValidator(t, validateAddress)
  const txAmountValidator = createTxAmountValidator(t, availableAmount)

  const feeValidationResult = validateFee(fee)

  const [feeEstimates, feeEstimateError, isFeeEstimationPending] = useAsyncUpdate(
    estimateTransactionFee,
    [],
  )

  const totalAmount = asEther(new BigNumber(amount).plus(fee))

  const remainingBalance = asWei(
    totalAmount.isFinite() ? availableAmount.minus(totalAmount) : availableAmount,
  )

  const disableSend =
    feeValidationResult !== 'OK' || !feeEstimates || !remainingBalance.isPositive()

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
        <DialogFee
          label={t(['wallet', 'label', 'transactionFee'])}
          feeEstimates={feeEstimates}
          feeEstimateError={feeEstimateError}
          onChange={(fee) => setTransactionParams({fee})}
          errorMessage={translateValidationResult(t, feeValidationResult)}
          isPending={isFeeEstimationPending}
        />
        <DialogColumns>
          <DialogShowAmount amount={totalAmount} displayExact>
            <Trans k={['wallet', 'label', 'totalTransactionAmount']} />
          </DialogShowAmount>
          <DialogShowAmount amount={remainingBalance} displayExact>
            <Trans k={['wallet', 'label', 'remainingBalance']} />
          </DialogShowAmount>
        </DialogColumns>
      </Dialog>
    </>
  )
}

interface SendAdvancedTransactionProps {
  onSend: () => void
  availableAmount: Wei
  transactionParams: AdvancedTransactionParams
  setTransactionParams: (advancedParams: Partial<AdvancedTransactionParams>) => void
  estimateTransactionFee: () => Promise<FeeEstimates>
  onCancel: () => void
}

const SendAdvancedTransaction: FunctionComponent<SendAdvancedTransactionProps & ModalProps> = ({
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

interface ConfirmTransactionProps {
  onClose: () => void
  transactionParams: BasicTransactionParams
  onCancel: () => void
}

const _ConfirmTransaction = ({
  transactionParams,
  onCancel,
  walletState,
}: PropsWithWalletState<ConfirmTransactionProps & ModalProps, LoadedState>): JSX.Element => {
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

const ConfirmTransaction = withStatusGuard(_ConfirmTransaction, 'LOADED')

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

const ConfirmAdvancedTransaction = withStatusGuard(_ConfirmAdvancedTransaction, 'LOADED')

interface SendTransactionFlowProps {
  availableAmount: Wei
  estimateTransactionFee: () => Promise<FeeEstimates>
  onCancel: () => void
}

export const _SendTransactionFlow: FunctionComponent<SendTransactionFlowProps & ModalProps> = ({
  availableAmount,
  onCancel,
  estimateTransactionFee,
}: SendTransactionFlowProps & ModalProps) => {
  const [transactionParams, setTransactionParams] = useState(defaultState)
  const [step, setStep] = useState<'send' | 'confirm'>('send')
  const [transactionType, _setTransactionType] = useState<TransactionType>(TransactionType.basic)

  const resetState = (): void => {
    setTransactionParams(defaultState)
  }

  const setTransactionType = (type: TransactionType): void => {
    _setTransactionType(type)
    resetState()
  }

  const setBasicTransactionParams = (basicParams: Partial<BasicTransactionParams>): void => {
    setTransactionParams((oldParams) => ({
      [TransactionType.basic]: {...oldParams[TransactionType.basic], ...basicParams},
      [TransactionType.advanced]: oldParams[TransactionType.advanced],
    }))
  }

  const setAdvancedTransactionParams = (
    advancedParams: Partial<AdvancedTransactionParams>,
  ): void => {
    setTransactionParams((oldParams) => ({
      [TransactionType.basic]: oldParams[TransactionType.basic],
      [TransactionType.advanced]: {...oldParams[TransactionType.advanced], ...advancedParams},
    }))
  }

  if (step === 'confirm') {
    return transactionType === 'BASIC' ? (
      <ConfirmTransaction
        transactionParams={transactionParams[transactionType]}
        onClose={onCancel}
        onCancel={() => setStep('send')}
      />
    ) : (
      <ConfirmAdvancedTransaction
        transactionParams={transactionParams[transactionType]}
        onClose={onCancel}
        onCancel={() => setStep('send')}
      />
    )
  } else {
    return (
      <>
        <DialogTextSwitch
          left={{label: 'Basic', type: TransactionType.basic}}
          right={{label: 'Advanced', type: TransactionType.advanced}}
          onChange={setTransactionType}
        />
        {transactionType === 'BASIC' ? (
          <SendTransaction
            transactionParams={transactionParams[TransactionType.basic]}
            setTransactionParams={setBasicTransactionParams}
            onSend={() => setStep('confirm')}
            availableAmount={availableAmount}
            estimateTransactionFee={estimateTransactionFee}
            onCancel={onCancel}
          />
        ) : (
          <SendAdvancedTransaction
            transactionParams={transactionParams[TransactionType.advanced]}
            setTransactionParams={setAdvancedTransactionParams}
            onSend={() => setStep('confirm')}
            availableAmount={availableAmount}
            estimateTransactionFee={estimateTransactionFee}
            onCancel={onCancel}
          />
        )}
      </>
    )
  }
}

export const SendTransactionFlow = wrapWithModal(_SendTransactionFlow, 'SendTransactionModal')
