import React, {useState} from 'react'
import BigNumber from 'bignumber.js'
import {DEFAULT_GAS_PRICE, DEFAULT_GAS_LIMIT} from './glacier-config'
import {GlacierState, Claim} from './glacier-state'
import {validateAmount, isGreaterOrEqual} from '../common/util'
import {wrapWithModal, ModalLocker, ModalOnCancel} from '../common/LunaModal'
import {Dialog} from '../common/Dialog'
import {DialogInput} from '../common/dialog/DialogInput'
import {DialogColumns} from '../common/dialog/DialogColumns'
import {DialogMessage} from '../common/dialog/DialogMessage'
import {DialogShowDust} from '../common/dialog/DialogShowDust'
import './SubmitProofOfUnlock.scss'

interface SubmitProofOfUnlockProps extends ModalOnCancel {
  claim: Claim
  currentBlock: number
  onNext: () => void
}

const _SubmitProofOfUnlock = ({
  claim,
  currentBlock,
  onNext,
  onCancel,
}: SubmitProofOfUnlockProps): JSX.Element => {
  const {unlock} = GlacierState.useContainer()
  const {transparentAddress, dustAmount} = claim

  const [gasPrice, setGasPrice] = useState<string>(DEFAULT_GAS_PRICE)
  const [gasLimit, setGasLimit] = useState<string>(DEFAULT_GAS_LIMIT)

  const modalLocker = ModalLocker.useContainer()

  const gasPriceError = validateAmount(gasPrice, [isGreaterOrEqual(0)])
  const gasLimitError = validateAmount(gasLimit, [isGreaterOrEqual(65536)])

  const disabled = gasPriceError !== '' || gasLimitError !== ''

  return (
    <Dialog
      title="Submit Proof of Unlock"
      rightButtonProps={{
        children: 'Submit',
        type: 'default',
        onClick: async () => {
          const callParams = {
            gasLimit: new BigNumber(gasLimit),
            gasPrice: new BigNumber(gasPrice),
          }
          await unlock(claim, callParams, currentBlock)
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
      <DialogMessage label="Midnight Transparent Address" description={transparentAddress} />
      <DialogShowDust amount={dustAmount}>Eligible Amount</DialogShowDust>
      <DialogColumns>
        <DialogInput
          autoFocus
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
  )
}

export const SubmitProofOfUnlock = wrapWithModal(_SubmitProofOfUnlock, 'SubmitProofOfUnlock')
