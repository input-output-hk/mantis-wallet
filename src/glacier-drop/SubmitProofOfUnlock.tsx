import React, {useState} from 'react'
import BigNumber from 'bignumber.js'
import {ModalProps} from 'antd/lib/modal'
import {DEFAULT_GAS_PRICE, DEFAULT_GAS_LIMIT} from './glacier-config'
import {GlacierState, Claim} from './glacier-state'
import {validateAmount, isGreaterOrEqual} from '../common/util'
import {LunaModal} from '../common/LunaModal'
import {Dialog} from '../common/Dialog'
import {DialogInput} from '../common/dialog/DialogInput'
import {DialogError} from '../common/dialog/DialogError'
import {DialogColumns} from '../common/dialog/DialogColumns'
import {DialogMessage} from '../common/dialog/DialogMessage'
import {DialogShowDust} from '../common/dialog/DialogShowDust'
import './SubmitProofOfUnlock.scss'

interface SubmitProofOfUnlockProps {
  claim: Claim
  currentBlock: number
  onNext: (unlockResult: string) => void
  onCancel: () => void
}

export const SubmitProofOfUnlock = ({
  claim,
  currentBlock,
  onNext,
  onCancel,
  ...props
}: SubmitProofOfUnlockProps & ModalProps): JSX.Element => {
  const {unlock} = GlacierState.useContainer()
  const {transparentAddress, dustAmount} = claim

  const [gasPrice, setGasPrice] = useState<string>(DEFAULT_GAS_PRICE)
  const [gasLimit, setGasLimit] = useState<string>(DEFAULT_GAS_LIMIT)

  const [isLoading, setLoading] = useState<boolean>(false)
  const [globalErrorMsg, setGlobalErrorMsg] = useState<string>('')

  const globalErrorElem = globalErrorMsg && <DialogError>{globalErrorMsg}</DialogError>

  const gasPriceError = validateAmount(gasPrice, [isGreaterOrEqual(0)])
  const gasLimitError = validateAmount(gasLimit, [isGreaterOrEqual(65536)])

  const disabled = gasPriceError !== '' || gasLimitError !== '' || isLoading

  const close = (): void => {
    if (isLoading) return
    setGasPrice(DEFAULT_GAS_PRICE)
    setGasLimit(DEFAULT_GAS_LIMIT)
    setGlobalErrorMsg('')
    onCancel()
  }

  return (
    <LunaModal destroyOnClose wrapClassName="SubmitProofOfUnlock" onCancel={close} {...props}>
      <Dialog
        title="Submit Proof of Unlock"
        rightButtonProps={{
          children: 'Submit',
          type: 'default',
          onClick: async () => {
            setLoading(true)
            try {
              const callParams = {
                gasLimit: new BigNumber(gasLimit),
                gasPrice: new BigNumber(gasPrice),
              }
              const response = await unlock(claim, callParams, currentBlock)
              setLoading(false)
              onNext(response)
            } catch (e) {
              setLoading(false)
              setGlobalErrorMsg(e.message)
            }
          },
          disabled,
        }}
        leftButtonProps={{
          onClick: close,
          disabled: isLoading,
        }}
        type="dark"
        footer={globalErrorElem}
      >
        <DialogMessage label="Midnight Transparent Address" description={transparentAddress} />
        <DialogShowDust amount={dustAmount}>Eligible Amount</DialogShowDust>
        <DialogColumns>
          <DialogInput
            label="Gas Price"
            defaultValue={gasPrice}
            onChange={(e): void => setGasPrice(e.target.value)}
            errorMessage={gasPriceError}
          />
          <DialogInput
            label="Gas Limit"
            defaultValue={gasLimit}
            onChange={(e): void => setGasLimit(e.target.value)}
            errorMessage={gasLimitError}
          />
        </DialogColumns>
      </Dialog>
    </LunaModal>
  )
}
