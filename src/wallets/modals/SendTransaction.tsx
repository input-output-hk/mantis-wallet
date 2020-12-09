import React, {FunctionComponent, useEffect, useState} from 'react'
import {ModalProps} from 'antd/lib/modal'
import {wrapWithModal} from '../../common/MantisModal'
import {etherValue, Wei} from '../../common/units'
import {DialogTextSwitch} from '../../common/dialog/DialogTextSwitch'
import {FeeEstimates, MIN_GAS_PRICE, TRANSFER_GAS_LIMIT} from '../../common/wallet-state'
import './SendTransaction.scss'
import {
  ConfirmAdvancedTransaction,
  ConfirmBasicTransaction,
  SendAdvancedTransaction,
  SendBasicTransaction,
} from '../sendTransaction'

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

interface SendTransactionFlowProps {
  availableAmount: Wei
  estimateTransactionFee: () => Promise<FeeEstimates>
  getNextNonce: () => Promise<number>
  onCancel: () => void
}

export const _SendTransactionFlow: FunctionComponent<SendTransactionFlowProps & ModalProps> = ({
  availableAmount,
  onCancel,
  estimateTransactionFee,
  getNextNonce,
}: SendTransactionFlowProps & ModalProps) => {
  const defaultState: TransactionParams = {
    [TransactionType.basic]: {
      amount: '0',
      fee: '',
      recipient: '',
    },
    [TransactionType.advanced]: {
      amount: '0',
      gasLimit: String(TRANSFER_GAS_LIMIT),
      gasPrice: etherValue(MIN_GAS_PRICE).toFixed(),
      recipient: '',
      data: '',
      nonce: '0',
    },
  }

  const [nonce, setNonce] = useState(0)
  useEffect(() => {
    getNextNonce().then(setNonce)
  })

  const [transactionParams, setTransactionParams] = useState<TransactionParams>(defaultState)

  const [step, setStep] = useState<'send' | 'confirm'>('send')
  const [transactionType, _setTransactionType] = useState<TransactionType>(TransactionType.basic)

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

  const resetState = (): void => {
    setTransactionParams(defaultState)
    setAdvancedTransactionParams({nonce: nonce.toString()})
  }

  const setTransactionType = (type: TransactionType): void => {
    resetState()
    _setTransactionType(type)
  }

  if (step === 'confirm') {
    return transactionType === TransactionType.basic ? (
      <ConfirmBasicTransaction
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
          left={{label: 'Transfer', type: TransactionType.basic}}
          right={{label: 'Advanced', type: TransactionType.advanced}}
          onChange={setTransactionType}
        />
        {transactionType === 'BASIC' ? (
          <SendBasicTransaction
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
            estimateTransactionFee={estimateTransactionFee}
            onCancel={onCancel}
          />
        )}
      </>
    )
  }
}

export const SendTransactionFlow = wrapWithModal(_SendTransactionFlow, 'SendTransactionModal')
