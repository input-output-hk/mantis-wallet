import React, {useState} from 'react'
import BigNumber from 'bignumber.js'
import {ModalProps} from 'antd/lib/modal'
import {validateAmount} from '../common/util'
import {LunaModal} from '../common/LunaModal'
import {Dialog} from '../common/Dialog'
import {DialogInput, DialogInputPassword} from '../common/dialog/DialogInput'
import {DialogColumns} from '../common/dialog/DialogColumns'
import {DialogMessage} from '../common/dialog/DialogMessage'
import './WithdrawAvailableDust.scss'

interface WithdrawAvailableDustProps {
  midnightAddress: string
  onNext: (
    dustAmount: BigNumber,
    gasPrice: BigNumber,
    gasLimit: BigNumber,
    passphrase: string,
  ) => void
  onCancel: () => void
}

export const WithdrawAvailableDust = ({
  midnightAddress,
  onNext,
  onCancel,
  ...props
}: WithdrawAvailableDustProps & ModalProps): JSX.Element => {
  const [dustAmount, setDustAmount] = useState<string>('0')
  const [gasPrice, setGasPrice] = useState<string>('0')
  const [gasLimit, setGasLimit] = useState<string>('0')
  const [passphrase, setPassphrase] = useState<string>('')

  const disabled =
    validateAmount(dustAmount) !== '' ||
    validateAmount(gasPrice) !== '' ||
    validateAmount(gasLimit) !== ''

  return (
    <LunaModal destroyOnClose wrapClassName="WithdrawAvailableDust" {...props}>
      <Dialog
        title="Withdraw Available Dust"
        rightButtonProps={{
          children: 'Withdraw',
          type: 'default',
          onClick: () =>
            onNext(
              new BigNumber(dustAmount),
              new BigNumber(gasPrice),
              new BigNumber(gasLimit),
              passphrase,
            ),
          disabled,
        }}
        leftButtonProps={{
          onClick: onCancel,
        }}
        type="dark"
      >
        <DialogMessage label="Midnight Transparent Address" description={midnightAddress} />
        <DialogInput
          label="Withdraw Available Dust"
          defaultValue={dustAmount}
          onChange={(e): void => setDustAmount(e.target.value)}
          errorMessage={validateAmount(dustAmount)}
        />
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
        <div className="more-info">view unfreezing progress</div>
      </Dialog>
    </LunaModal>
  )
}
