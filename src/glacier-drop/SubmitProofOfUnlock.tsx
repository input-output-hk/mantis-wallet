import React, {useState} from 'react'
import BigNumber from 'bignumber.js'
import {DEFAULT_GAS_LIMIT, DEFAULT_FEE} from './glacier-config'
import {GlacierState, Claim} from './glacier-state'
import {LoadedState, FeeEstimates} from '../common/wallet-state'
import {validateFee} from '../common/util'
import {useAsyncUpdate} from '../common/hook-utils'
import {COULD_NOT_UPDATE_FEE_ESTIMATES} from '../common/fee-estimate-strings'
import {wrapWithModal, ModalLocker, ModalOnCancel} from '../common/LunaModal'
import {Dialog} from '../common/Dialog'
import {DialogMessage} from '../common/dialog/DialogMessage'
import {DialogShowDust} from '../common/dialog/DialogShowDust'
import {DialogFee} from '../common/dialog/DialogFee'
import {DialogError} from '../common/dialog/DialogError'
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
      footer={footer}
    >
      <DialogMessage label="Midnight Transparent Address">{transparentAddress}</DialogMessage>
      <DialogShowDust amount={dustAmount}>Eligible Amount</DialogShowDust>
      <DialogFee
        label="Fee"
        feeEstimates={feeEstimates}
        onChange={setFee}
        errorMessage={feeError}
        isPending={isFeeEstimationPending}
      />
    </Dialog>
  )
}

export const SubmitProofOfUnlock = wrapWithModal(_SubmitProofOfUnlock, 'SubmitProofOfUnlock')
