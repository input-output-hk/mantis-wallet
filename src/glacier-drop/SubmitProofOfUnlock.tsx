import React, {useState} from 'react'
import BigNumber from 'bignumber.js'
import {DEFAULT_GAS_PRICE, DEFAULT_GAS_LIMIT} from './glacier-config'
import {GlacierState, Claim} from './glacier-state'
import {LoadedState, FeeEstimates} from '../common/wallet-state'
import {validateAmount, isGreaterOrEqual} from '../common/util'
import {useAsyncUpdate} from '../common/hook-utils'
import {COULD_NOT_UPDATE_FEE_ESTIMATES} from '../common/fee-estimate-strings'
import {wrapWithModal, ModalLocker, ModalOnCancel} from '../common/LunaModal'
import {Dialog} from '../common/Dialog'
import {DialogMessage} from '../common/dialog/DialogMessage'
import {DialogShowDust} from '../common/dialog/DialogShowDust'
import {DialogFee, handleGasPriceUpdate} from '../common/dialog/DialogFee'
import {DialogError} from '../common/dialog/DialogError'
import './SubmitProofOfUnlock.scss'

interface SubmitProofOfUnlockProps extends ModalOnCancel {
  claim: Claim
  currentBlock: number
  onNext: () => void
  estimateCallFee: LoadedState['estimateCallFee']
  estimateGasPrice: LoadedState['estimateGasPrice']
}

const _SubmitProofOfUnlock = ({
  claim,
  currentBlock,
  onNext,
  onCancel,
  estimateCallFee,
  estimateGasPrice,
}: SubmitProofOfUnlockProps): JSX.Element => {
  const {unlock, getUnlockCallParams} = GlacierState.useContainer()
  const modalLocker = ModalLocker.useContainer()

  const {transparentAddress, dustAmount} = claim
  const [gasPrice, setGasPrice] = useState<string>(DEFAULT_GAS_PRICE)
  const gasPriceError = validateAmount(gasPrice, [isGreaterOrEqual()])

  const [gasPriceEstimates, gasPriceEstimateError, isGasPricePending] = useAsyncUpdate(
    estimateGasPrice,
    [],
  )

  const [feeEstimates, feeEstimateError, isFeeEstimationPending] = useAsyncUpdate(
    (): Promise<FeeEstimates> =>
      estimateCallFee(
        getUnlockCallParams(claim, {gasPrice: new BigNumber(0), gasLimit: new BigNumber(0)}),
      ),
    [],
  )

  const disabled =
    !!gasPriceEstimateError || !!feeEstimateError || isGasPricePending || isFeeEstimationPending

  const footer =
    !feeEstimates || feeEstimateError == null ? (
      <></>
    ) : (
      <DialogError>{COULD_NOT_UPDATE_FEE_ESTIMATES}</DialogError>
    )

  return (
    <Dialog
      title="Submit Proof of Unlock"
      rightButtonProps={{
        children: 'Submit',
        type: 'default',
        onClick: async () => {
          const gasParams = {
            gasLimit: new BigNumber(DEFAULT_GAS_LIMIT),
            gasPrice: new BigNumber(gasPrice),
          }
          await unlock(claim, gasParams, currentBlock)
          onNext()
        },
        disabled,
      }}
      leftButtonProps={{
        onClick: onCancel,
        disabled: modalLocker.isLocked,
      }}
      onSetLoading={modalLocker.setLocked}
      type="dark"
      footer={footer}
    >
      <DialogMessage label="Midnight Transparent Address">{transparentAddress}</DialogMessage>
      <DialogShowDust amount={dustAmount}>Eligible Amount</DialogShowDust>
      <DialogFee
        label="Fee"
        // show loading screen until gasPrices are loaded
        feeEstimates={gasPriceEstimates ? feeEstimates : undefined}
        onChange={handleGasPriceUpdate(setGasPrice, gasPriceEstimates)}
        errorMessage={gasPriceError}
        isPending={isFeeEstimationPending || isGasPricePending}
        hideCustom
      />
    </Dialog>
  )
}

export const SubmitProofOfUnlock = wrapWithModal(_SubmitProofOfUnlock, 'SubmitProofOfUnlock')
