import React, {useState} from 'react'
import BigNumber from 'bignumber.js'
import {DEFAULT_GAS_PRICE, DEFAULT_GAS_LIMIT} from './glacier-config'
import {GlacierState, Claim, PeriodConfig, isUnlocked} from './glacier-state'
import {validateAmount, isGreaterOrEqual} from '../common/util'
import {ModalOnCancel, wrapWithModal, ModalLocker} from '../common/LunaModal'
import {Dialog} from '../common/Dialog'
import {DialogInput} from '../common/dialog/DialogInput'
import {DialogColumns} from '../common/dialog/DialogColumns'
import {DialogMessage} from '../common/dialog/DialogMessage'
import {DialogShowDust} from '../common/dialog/DialogShowDust'
import {getUnfrozenAmount, getNumberOfEpochsForClaim, getCurrentEpoch} from './Period'
import './WithdrawAvailableDust.scss'

interface WithdrawAvailableDustProps extends ModalOnCancel {
  claim: Claim
  currentBlock: number
  periodConfig: PeriodConfig
  showEpochs: () => void
  onNext: (withdrawTxHash: string) => void
}

const _WithdrawAvailableDust = ({
  claim,
  periodConfig,
  currentBlock,
  showEpochs,
  onNext,
  onCancel,
}: WithdrawAvailableDustProps): JSX.Element => {
  const {withdraw} = GlacierState.useContainer()
  const {transparentAddress, withdrawnDustAmount, dustAmount} = claim

  const [gasPrice, setGasPrice] = useState<string>(DEFAULT_GAS_PRICE)
  const [gasLimit, setGasLimit] = useState<string>(DEFAULT_GAS_LIMIT)

  const modalLocker = ModalLocker.useContainer()

  const currentEpoch = getCurrentEpoch(currentBlock, periodConfig)
  const numberOfEpochsForClaim = getNumberOfEpochsForClaim(claim, periodConfig)
  const unfrozenDustAmount = getUnfrozenAmount(
    dustAmount,
    currentEpoch,
    numberOfEpochsForClaim,
    isUnlocked(claim),
  )
  const estimatedWithdrawableDust = unfrozenDustAmount.minus(withdrawnDustAmount)

  const gasPriceError = validateAmount(gasPrice, [isGreaterOrEqual(0)])
  const gasLimitError = validateAmount(gasLimit, [isGreaterOrEqual(65536)])

  const disabled =
    gasPriceError !== '' || gasLimitError !== '' || estimatedWithdrawableDust.isEqualTo(0)

  return (
    <Dialog
      title="Withdraw Available Dust"
      rightButtonProps={{
        children: 'Withdraw',
        type: 'default',
        onClick: async () => {
          const callParams = {
            gasLimit: new BigNumber(gasLimit),
            gasPrice: new BigNumber(gasPrice),
          }
          const withdrawTxHash = await withdraw(claim, callParams, currentBlock, unfrozenDustAmount)
          onNext(withdrawTxHash)
        },
        disabled,
      }}
      leftButtonProps={{
        onClick: onCancel,
        disabled: modalLocker.isLocked,
      }}
      type="dark"
    >
      <DialogMessage label="Midnight Transparent Address" description={transparentAddress} />
      <DialogShowDust amount={estimatedWithdrawableDust} />
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
      <div
        className="more-info"
        onClick={() => {
          close()
          showEpochs()
        }}
      >
        view unfreezing progress
      </div>
    </Dialog>
  )
}

export const WithdrawAvailableDust = wrapWithModal(_WithdrawAvailableDust, 'WithdrawAvailableDust')
