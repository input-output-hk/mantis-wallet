import React, {useState} from 'react'
import BigNumber from 'bignumber.js'
import {DEFAULT_GAS_LIMIT, DEFAULT_FEE} from './glacier-config'
import {GlacierState, Claim, PeriodConfig, isUnlocked} from './glacier-state'
import {LoadedState, FeeEstimates, CallTxStatuses} from '../common/wallet-state'
import {validateFee, fillActionHandlers, translateValidationResult} from '../common/util'
import {useAsyncUpdate} from '../common/hook-utils'
import {wrapWithModal, ModalLocker} from '../common/LunaModal'
import {Dialog} from '../common/Dialog'
import {DialogMessage} from '../common/dialog/DialogMessage'
import {DialogShowDust} from '../common/dialog/DialogShowDust'
import {DialogFee} from '../common/dialog/DialogFee'
import {getUnfrozenAmount, getNumberOfEpochsForClaim, getCurrentEpoch} from './Period'
import {UNITS} from '../common/units'
import {useTranslation} from '../settings-state'
import './WithdrawAvailableDust.scss'

const {Dust} = UNITS

interface WithdrawAvailableDustProps {
  claim: Claim
  currentBlock: number
  periodConfig: PeriodConfig
  callTxStatuses: CallTxStatuses
  showEpochs: () => void
  onNext: () => void
  onCancel: () => void
  estimateCallFee: LoadedState['estimateCallFee']
  calculateGasPrice: LoadedState['calculateGasPrice']
}

const _WithdrawAvailableDust = ({
  claim,
  currentBlock,
  periodConfig,
  callTxStatuses,
  showEpochs,
  onNext,
  onCancel,
  estimateCallFee,
  calculateGasPrice,
}: WithdrawAvailableDustProps): JSX.Element => {
  const {withdraw, getWithdrawCallParams} = GlacierState.useContainer()
  const {t} = useTranslation()
  const modalLocker = ModalLocker.useContainer()

  const {transparentAddress, withdrawnDustAmount, dustAmount} = claim

  const [fee, setFee] = useState(DEFAULT_FEE)
  const feeValidationResult = validateFee(fee)

  const [feeEstimates, feeEstimateError, isFeeEstimationPending] = useAsyncUpdate(
    (): Promise<FeeEstimates> =>
      estimateCallFee(
        getWithdrawCallParams(claim, {gasPrice: new BigNumber(0), gasLimit: new BigNumber(0)}),
      ),
    [],
  )

  const disabled = feeValidationResult !== 'OK' || !feeEstimates

  const currentEpoch = getCurrentEpoch(currentBlock, periodConfig)
  const numberOfEpochsForClaim = getNumberOfEpochsForClaim(claim, periodConfig)
  const unfrozenDustAmount = getUnfrozenAmount(
    dustAmount,
    currentEpoch,
    numberOfEpochsForClaim,
    isUnlocked(claim, callTxStatuses),
  )
  const estimatedWithdrawableDust = unfrozenDustAmount.minus(withdrawnDustAmount)

  return (
    <Dialog
      title="Withdraw Available Dust"
      rightButtonProps={{
        children: 'Withdraw',
        onClick: async () => {
          const gasPrice = await calculateGasPrice(
            parseInt(Dust.toBasic(fee)),
            getWithdrawCallParams(claim, {
              gasPrice: new BigNumber(0),
              gasLimit: new BigNumber(DEFAULT_GAS_LIMIT),
            }),
          )
          const gasParams = {
            gasLimit: new BigNumber(DEFAULT_GAS_LIMIT),
            gasPrice: new BigNumber(gasPrice),
          }
          await withdraw(claim, gasParams, unfrozenDustAmount)
          onNext()
        },
        disabled,
      }}
      leftButtonProps={{
        onClick: onCancel,
        disabled: modalLocker.isLocked,
      }}
      type="dark"
    >
      <DialogMessage label="Midnight Transparent Address">{transparentAddress}</DialogMessage>
      <DialogShowDust amount={estimatedWithdrawableDust}>Eligible Amount</DialogShowDust>
      <DialogFee
        label="Fee"
        feeEstimates={feeEstimates}
        feeEstimateError={feeEstimateError}
        onChange={setFee}
        errorMessage={translateValidationResult(t, feeValidationResult)}
        isPending={isFeeEstimationPending}
      />
      <div
        className="more-info"
        {...fillActionHandlers(() => {
          onCancel()
          showEpochs()
        }, 'link')}
      >
        view unfreezing progress
      </div>
    </Dialog>
  )
}

export const WithdrawAvailableDust = wrapWithModal(_WithdrawAvailableDust, 'WithdrawAvailableDust')
