import React, {useState} from 'react'
import BigNumber from 'bignumber.js'
import {ModalProps} from 'antd/lib/modal'
import {DEFAULT_GAS_PRICE, DEFAULT_GAS_LIMIT} from './glacier-config'
import {GlacierState, Claim, PeriodConfig, isUnlocked} from './glacier-state'
import {validateAmount, isGreaterOrEqual} from '../common/util'
import {LunaModal} from '../common/LunaModal'
import {Dialog} from '../common/Dialog'
import {DialogInput} from '../common/dialog/DialogInput'
import {DialogColumns} from '../common/dialog/DialogColumns'
import {DialogMessage} from '../common/dialog/DialogMessage'
import {DialogError} from '../common/dialog/DialogError'
import {DialogShowDust} from '../common/dialog/DialogShowDust'
import {getUnfrozenAmount, getNumberOfEpochsForClaim, getCurrentEpoch} from './Period'
import './WithdrawAvailableDust.scss'

interface WithdrawAvailableDustProps {
  claim: Claim
  currentBlock: number
  periodConfig: PeriodConfig
  showEpochs: () => void
  onNext: (withdrawTxHash: string) => void
  onCancel: () => void
}

export const WithdrawAvailableDust = ({
  claim,
  periodConfig,
  currentBlock,
  showEpochs,
  onNext,
  onCancel,
  ...props
}: WithdrawAvailableDustProps & ModalProps): JSX.Element => {
  const {withdraw} = GlacierState.useContainer()
  const {transparentAddress, withdrawnDustAmount, dustAmount} = claim

  const [gasPrice, setGasPrice] = useState<string>(DEFAULT_GAS_PRICE)
  const [gasLimit, setGasLimit] = useState<string>(DEFAULT_GAS_LIMIT)
  const [isLoading, setLoading] = useState<boolean>(false)
  const [globalErrorMsg, setGlobalErrorMsg] = useState<string>('')

  const globalErrorElem = globalErrorMsg && <DialogError>{globalErrorMsg}</DialogError>

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
    gasPriceError !== '' ||
    gasLimitError !== '' ||
    estimatedWithdrawableDust.isEqualTo(0) ||
    isLoading

  const close = (): void => {
    if (isLoading) return
    setGasPrice(DEFAULT_GAS_PRICE)
    setGasLimit(DEFAULT_GAS_LIMIT)
    setGlobalErrorMsg('')
    onCancel()
  }

  return (
    <LunaModal destroyOnClose wrapClassName="WithdrawAvailableDust" onCancel={close} {...props}>
      <Dialog
        title="Withdraw Available Dust"
        rightButtonProps={{
          children: 'Withdraw',
          type: 'default',
          onClick: async () => {
            setLoading(true)
            try {
              const callParams = {
                gasLimit: new BigNumber(gasLimit),
                gasPrice: new BigNumber(gasPrice),
              }
              const withdrawTxHash = await withdraw(
                claim,
                callParams,
                currentBlock,
                unfrozenDustAmount,
              )
              setLoading(false)
              onNext(withdrawTxHash)
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
    </LunaModal>
  )
}
