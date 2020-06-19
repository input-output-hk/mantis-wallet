import React, {useState} from 'react'
import BigNumber from 'bignumber.js'
import {DEFAULT_GAS_PRICE, DEFAULT_GAS_LIMIT} from './glacier-config'
import {GlacierState, Claim, PeriodConfig, isUnlocked} from './glacier-state'
import {LoadedState, FeeEstimates} from '../common/wallet-state'
import {validateAmount, isGreaterOrEqual} from '../common/util'
import {useAsyncUpdate} from '../common/hook-utils'
import {COULD_NOT_UPDATE_FEE_ESTIMATES} from '../common/fee-estimate-strings'
import {wrapWithModal, ModalLocker} from '../common/LunaModal'
import {Dialog} from '../common/Dialog'
import {DialogMessage} from '../common/dialog/DialogMessage'
import {DialogShowDust} from '../common/dialog/DialogShowDust'
import {DialogFee, handleGasPriceUpdate} from '../common/dialog/DialogFee'
import {DialogError} from '../common/dialog/DialogError'
import {getUnfrozenAmount, getNumberOfEpochsForClaim, getCurrentEpoch} from './Period'
import './WithdrawAvailableDust.scss'

interface WithdrawAvailableDustProps {
  claim: Claim
  currentBlock: number
  periodConfig: PeriodConfig
  showEpochs: () => void
  onNext: () => void
  onCancel: () => void
  estimateCallFee: LoadedState['estimateCallFee']
  estimateGasPrice: LoadedState['estimateGasPrice']
}

const _WithdrawAvailableDust = ({
  claim,
  periodConfig,
  currentBlock,
  showEpochs,
  onNext,
  onCancel,
  estimateCallFee,
  estimateGasPrice,
}: WithdrawAvailableDustProps): JSX.Element => {
  const {withdraw, getWithdrawCallParams} = GlacierState.useContainer()
  const modalLocker = ModalLocker.useContainer()

  const {transparentAddress, withdrawnDustAmount, dustAmount} = claim

  const [gasPrice, setGasPrice] = useState<string>(DEFAULT_GAS_PRICE)
  const gasPriceError = validateAmount(gasPrice, [isGreaterOrEqual()])

  const [gasPriceEstimates, gasPriceEstimateError, isGasPricePending] = useAsyncUpdate(
    estimateGasPrice,
    [],
  )

  const [feeEstimates, feeEstimateError, isFeeEstimationPending] = useAsyncUpdate(
    (): Promise<FeeEstimates> =>
      estimateCallFee(
        getWithdrawCallParams(claim, {gasPrice: new BigNumber(0), gasLimit: new BigNumber(0)}),
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

  const currentEpoch = getCurrentEpoch(currentBlock, periodConfig)
  const numberOfEpochsForClaim = getNumberOfEpochsForClaim(claim, periodConfig)
  const unfrozenDustAmount = getUnfrozenAmount(
    dustAmount,
    currentEpoch,
    numberOfEpochsForClaim,
    isUnlocked(claim),
  )
  const estimatedWithdrawableDust = unfrozenDustAmount.minus(withdrawnDustAmount)

  return (
    <Dialog
      title="Withdraw Available Dust"
      rightButtonProps={{
        children: 'Withdraw',
        type: 'default',
        onClick: async () => {
          const gasParams = {
            gasLimit: new BigNumber(DEFAULT_GAS_LIMIT),
            gasPrice: new BigNumber(gasPrice),
          }
          await withdraw(claim, gasParams, currentBlock, unfrozenDustAmount)
          onNext()
        },
        disabled,
      }}
      leftButtonProps={{
        onClick: onCancel,
        disabled: modalLocker.isLocked,
      }}
      type="dark"
      footer={footer}
    >
      <DialogMessage label="Midnight Transparent Address" description={transparentAddress} />
      <DialogShowDust amount={estimatedWithdrawableDust} />
      <DialogFee
        label="Fee"
        // show loading screen until gasPrices are loaded
        feeEstimates={gasPriceEstimates ? feeEstimates : undefined}
        onChange={handleGasPriceUpdate(setGasPrice, gasPriceEstimates)}
        errorMessage={gasPriceError}
        isPending={isFeeEstimationPending || isGasPricePending}
        hideCustom
      />
      <div
        className="more-info"
        onClick={() => {
          onCancel()
          showEpochs()
        }}
      >
        view unfreezing progress
      </div>
    </Dialog>
  )
}

export const WithdrawAvailableDust = wrapWithModal(_WithdrawAvailableDust, 'WithdrawAvailableDust')
