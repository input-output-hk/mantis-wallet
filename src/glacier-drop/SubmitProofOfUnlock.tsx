import React, {useState} from 'react'
import BigNumber from 'bignumber.js'
import {DEFAULT_GAS_LIMIT, DEFAULT_FEE} from './glacier-config'
import {GlacierState, Claim} from './glacier-state'
import {LoadedState, FeeEstimates} from '../common/wallet-state'
import {validateFee} from '../common/util'
import {useAsyncUpdate} from '../common/hook-utils'
import {wrapWithModal, ModalLocker, ModalOnCancel} from '../common/LunaModal'
import {Dialog} from '../common/Dialog'
import {DialogMessage} from '../common/dialog/DialogMessage'
import {DialogShowDust} from '../common/dialog/DialogShowDust'
import {DialogFee} from '../common/dialog/DialogFee'
import {UNITS} from '../common/units'
import './SubmitProofOfUnlock.scss'

const {Dust} = UNITS

interface SubmitProofOfUnlockProps extends ModalOnCancel {
  claim: Claim
  currentBlock: number
  onNext: () => void
  estimateCallFee: LoadedState['estimateCallFee']
  calculateGasPrice: LoadedState['calculateGasPrice']
}

const _SubmitProofOfUnlock = ({
  claim,
  currentBlock,
  onNext,
  onCancel,
  estimateCallFee,
  calculateGasPrice,
}: SubmitProofOfUnlockProps): JSX.Element => {
  const {unlock, getUnlockCallParams} = GlacierState.useContainer()
  const modalLocker = ModalLocker.useContainer()

  const {transparentAddress, dustAmount} = claim

  const [fee, setFee] = useState(DEFAULT_FEE)
  const feeError = validateFee(fee)

  const [feeEstimates, feeEstimateError, isFeeEstimationPending] = useAsyncUpdate(
    (): Promise<FeeEstimates> =>
      estimateCallFee(
        getUnlockCallParams(claim, {gasPrice: new BigNumber(0), gasLimit: new BigNumber(0)}),
      ),
    [],
  )

  const disabled = !!feeError || !!feeEstimateError || isFeeEstimationPending

  return (
    <Dialog
      title="Submit Proof of Unlock"
      rightButtonProps={{
        children: 'Submit',
        onClick: async () => {
          const gasPrice = await calculateGasPrice(
            parseInt(Dust.toBasic(fee)),
            getUnlockCallParams(claim, {
              gasPrice: new BigNumber(0),
              gasLimit: new BigNumber(DEFAULT_GAS_LIMIT),
            }),
          )
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
    >
      <DialogMessage label="Midnight Transparent Address">{transparentAddress}</DialogMessage>
      <DialogShowDust amount={dustAmount}>Eligible Amount</DialogShowDust>
      <DialogFee
        label="Fee"
        feeEstimates={feeEstimates}
        feeEstimateError={feeEstimateError}
        onChange={setFee}
        errorMessage={feeError}
        isPending={isFeeEstimationPending}
      />
    </Dialog>
  )
}

export const SubmitProofOfUnlock = wrapWithModal(_SubmitProofOfUnlock, 'SubmitProofOfUnlock')
