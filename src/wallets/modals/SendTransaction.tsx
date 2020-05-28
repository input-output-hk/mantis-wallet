import React, {useState, PropsWithChildren} from 'react'
import _ from 'lodash/fp'
import BigNumber from 'bignumber.js'
import {ModalProps} from 'antd/lib/modal'
import {ModalLocker, ModalOnCancel, wrapWithModal} from '../../common/LunaModal'
import {Dialog} from '../../common/Dialog'
import {DialogDropdown} from '../../common/dialog/DialogDropdown'
import {DialogInput} from '../../common/dialog/DialogInput'
import {Account, FeeLevel} from '../../web3'
import {
  validateAmount,
  hasAtMostDecimalPlaces,
  isGreaterOrEqual,
  validateTxAmount,
  validateFee,
} from '../../common/util'
import {UNITS} from '../../common/units'
import {DialogShowDust} from '../../common/dialog/DialogShowDust'
import {DialogTextSwitch} from '../../common/dialog/DialogTextSwitch'
import {DialogApproval} from '../../common/dialog/DialogApproval'
import {DialogFee} from '../../common/dialog/DialogFee'
import {FeeEstimates} from '../../common/wallet-state'
import {DialogError} from '../../common/dialog/DialogError'
import {useAsyncUpdate} from '../../common/hook-utils'
import {INVALID_AMOUNT_FOR_FEE_ESTIMATION, COULD_NOT_UPDATE_FEE_ESTIMATES} from './tx-strings'

const {Dust} = UNITS

interface SendToConfidentialDialogProps extends ModalOnCancel {
  estimateTransactionFee: (amount: BigNumber) => Promise<FeeEstimates>
  onSend: (recipient: string, amount: number, fee: number) => Promise<void>
  availableAmount: BigNumber
}

interface SendToTransparentDialogProps extends ModalOnCancel {
  estimateGasPrice: () => Promise<FeeEstimates>
  estimatePublicTransactionFee: (amount: BigNumber, recipient: string) => Promise<FeeEstimates>
  onSendToTransparent: (recipient: string, amount: BigNumber, gasPrice: BigNumber) => Promise<void>
  availableAmount: BigNumber
}

interface SendTransactionProps extends SendToConfidentialDialogProps, SendToTransparentDialogProps {
  accounts: Account[]
}

const SendToConfidentialDialog = ({
  estimateTransactionFee,
  onSend,
  availableAmount,
  onCancel,
  children,
}: PropsWithChildren<SendToConfidentialDialogProps>): JSX.Element => {
  const [amount, setAmount] = useState('0')
  const [fee, setFee] = useState('0')
  const [recipient, setRecipient] = useState('')

  const modalLocker = ModalLocker.useContainer()

  const feeError = validateFee(fee)
  const amountError = validateTxAmount(amount, availableAmount)

  const [feeEstimates, feeEstimateError, isPending] = useAsyncUpdate((): Promise<FeeEstimates> => {
    // let's provide some default for zero amount
    if (amountError === '' || amount === '0') {
      return estimateTransactionFee(Dust.toBasic(new BigNumber(amount)))
    } else {
      return Promise.reject(INVALID_AMOUNT_FOR_FEE_ESTIMATION)
    }
  }, [amount])

  const disableSend = !!feeError || !!amountError || recipient.length === 0 || isPending

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
      leftButtonProps={{
        onClick: onCancel,
        disabled: modalLocker.isLocked,
      }}
      rightButtonProps={{
        children: 'Send →',
        onClick: (): Promise<void> =>
          onSend(recipient, Number(Dust.toBasic(amount)), Number(Dust.toBasic(fee))),
        disabled: disableSend,
      }}
      onSetLoading={modalLocker.setLocked}
      footer={footer}
      type="dark"
    >
      {children}
      <DialogInput
        autoFocus
        label="Recipient"
        onChange={(e): void => setRecipient(e.target.value)}
        errorMessage={recipient.length === 0 ? 'Recipient must be set' : ''}
      />
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
    </Dialog>
  )
}

const SendToTransparentDialog = ({
  onSendToTransparent,
  estimateGasPrice,
  estimatePublicTransactionFee,
  availableAmount,
  onCancel,
  children,
}: PropsWithChildren<SendToTransparentDialogProps>): JSX.Element => {
  const [amount, setAmount] = useState('0')
  const [gasPrice, setGasPrice] = useState('1')
  const [recipient, setRecipient] = useState('')
  const [approval, setApproval] = useState(false)

  const modalLocker = ModalLocker.useContainer()

  const gasPriceError = validateAmount(gasPrice, [isGreaterOrEqual(), hasAtMostDecimalPlaces(0)])
  const amountError = validateTxAmount(amount, availableAmount)

  const [feeEstimates, feeEstimateError, isPending] = useAsyncUpdate((): Promise<FeeEstimates> => {
    // let's provide some default for zero amount
    if (amountError === '' || amount === '0') {
      return estimatePublicTransactionFee(Dust.toBasic(new BigNumber(amount)), recipient)
    } else {
      return Promise.reject(INVALID_AMOUNT_FOR_FEE_ESTIMATION)
    }
  }, [amount, recipient])

  const [gasPriceEstimates, gasPriceEstimateError, isGasPricePending] = useAsyncUpdate(
    estimateGasPrice,
    [],
  )

  const disableSend =
    !!gasPriceError ||
    !!amountError ||
    recipient.length === 0 ||
    !approval ||
    !!gasPriceEstimateError ||
    isGasPricePending ||
    isPending

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
      leftButtonProps={{
        onClick: onCancel,
        disabled: modalLocker.isLocked,
      }}
      rightButtonProps={{
        children: 'Send →',
        onClick: (): Promise<void> =>
          onSendToTransparent(
            recipient,
            new BigNumber(Dust.toBasic(amount)),
            new BigNumber(gasPrice),
          ),
        disabled: disableSend,
      }}
      onSetLoading={modalLocker.setLocked}
      footer={footer}
      type="dark"
    >
      {children}
      <DialogInput
        label="Recipient"
        onChange={(e): void => setRecipient(e.target.value)}
        errorMessage={recipient.length === 0 ? 'Recipient must be set' : ''}
      />
      <DialogInput
        label="Amount"
        defaultValue={amount}
        onChange={(e): void => setAmount(e.target.value)}
        errorMessage={amountError}
      />
      <DialogFee
        label="Fee"
        // show loading screen until gasPrices are loaded
        feeEstimates={gasPriceEstimates ? feeEstimates : undefined}
        onChange={(_fee: string, feeLevel: FeeLevel | null): void => {
          if (gasPriceEstimates && feeLevel) {
            setGasPrice(gasPriceEstimates[feeLevel].toString(10))
          } else {
            if (!gasPriceEstimates)
              console.warn(`gasPriceEstimates should be set, got ${gasPriceEstimates}`)
            if (!feeLevel) console.warn('feeLevel should be set, got null')
          }
        }}
        errorMessage={gasPriceError}
        isPending={isPending || isGasPricePending}
        hideCustom
      />
      <DialogApproval
        checked={approval}
        onChange={setApproval}
        description={
          <>
            <b>Warning:</b> I understand that the funds included in this transaction will no longer
            be confidential.
          </>
        }
      />
    </Dialog>
  )
}

export const _SendTransaction: React.FunctionComponent<SendTransactionProps & ModalProps> = ({
  accounts,
  availableAmount,
  estimateTransactionFee,
  onSend,
  estimateGasPrice,
  estimatePublicTransactionFee,
  onSendToTransparent,
  ...props
}: SendTransactionProps & ModalProps) => {
  const [mode, setMode] = useState<'transparent' | 'confidential'>('confidential')
  const modalLocker = ModalLocker.useContainer()

  return (
    <>
      <Dialog
        leftButtonProps={{
          doNotRender: true,
        }}
        rightButtonProps={{
          doNotRender: true,
        }}
      >
        <DialogTextSwitch
          defaultMode={mode}
          left={{label: 'Confidential', type: 'confidential'}}
          right={{label: 'Transparent', type: 'transparent'}}
          disabled={modalLocker.isLocked}
          onChange={setMode}
        />
        <DialogDropdown
          label="Select Account"
          options={accounts.map(({address}) => address).filter(_.isString)}
        />
        <DialogShowDust amount={availableAmount}>Available Amount</DialogShowDust>
      </Dialog>
      <div style={{display: mode === 'confidential' ? 'block' : 'none'}}>
        <SendToConfidentialDialog
          onCancel={props.onCancel}
          onSend={onSend}
          estimateTransactionFee={estimateTransactionFee}
          availableAmount={availableAmount}
        />
      </div>
      <div style={{display: mode === 'transparent' ? 'block' : 'none'}}>
        <SendToTransparentDialog
          onCancel={props.onCancel}
          onSendToTransparent={onSendToTransparent}
          estimateGasPrice={estimateGasPrice}
          estimatePublicTransactionFee={estimatePublicTransactionFee}
          availableAmount={availableAmount}
        />
      </div>
    </>
  )
}

export const SendTransaction = wrapWithModal(_SendTransaction)
