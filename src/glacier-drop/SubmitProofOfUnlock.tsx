import React, {useState} from 'react'
import BigNumber from 'bignumber.js'
import {ModalProps} from 'antd/lib/modal'
import {validateAmount} from '../common/util'
import {LunaModal} from '../common/LunaModal'
import {Dialog} from '../common/Dialog'
import {DialogInput, DialogInputPassword} from '../common/dialog/DialogInput'
import {DialogColumns} from '../common/dialog/DialogColumns'
import {DialogMessage} from '../common/dialog/DialogMessage'
import {EstimatedDust} from './claim-dust/EstimatedDust'
import './SubmitProofOfUnlock.scss'

interface SubmitProofOfUnlockProps {
  midnightAmount: BigNumber
  midnightAddress: string
  onNext: (gasPrice: BigNumber, gasLimit: BigNumber, passphrase: string) => void
  onCancel: () => void
}

export const SubmitProofOfUnlock = ({
  midnightAmount,
  midnightAddress,
  onNext,
  onCancel,
  ...props
}: SubmitProofOfUnlockProps & ModalProps): JSX.Element => {
  const [gasPrice, setGasPrice] = useState<string>('0')
  const [gasLimit, setGasLimit] = useState<string>('0')
  const [passphrase, setPassphrase] = useState<string>('')

  const disabled = validateAmount(gasPrice) !== '' || validateAmount(gasLimit) !== ''

  return (
    <LunaModal destroyOnClose wrapClassName="SubmitProofOfUnlock" {...props}>
      <Dialog
        title="Submit Proof of Unlock"
        rightButtonProps={{
          children: 'Submit',
          type: 'default',
          onClick: () => onNext(new BigNumber(gasPrice), new BigNumber(gasLimit), passphrase),
          disabled,
        }}
        leftButtonProps={{
          onClick: onCancel,
        }}
        type="dark"
      >
        <DialogMessage label="Midnight Transparent Address" description={midnightAddress} />
        <EstimatedDust amount={midnightAmount}>Eligible Amount</EstimatedDust>
        <DialogColumns>
          <DialogInput
            label="Gas Price"
            defaultValue={gasPrice}
            onChange={(e): void => setGasPrice(e.target.value)}
            errorMessage={validateAmount(gasPrice)}
          />
          <DialogInput
            label="Gas Limit"
            defaultValue={gasLimit}
            onChange={(e): void => setGasLimit(e.target.value)}
            errorMessage={validateAmount(gasLimit)}
          />
        </DialogColumns>
        <DialogInputPassword
          label="Spending Password for Luna Wallet"
          onChange={(e): void => setPassphrase(e.target.value)}
        />
      </Dialog>
    </LunaModal>
  )
}
