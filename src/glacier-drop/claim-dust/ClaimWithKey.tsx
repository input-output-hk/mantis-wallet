import React, {useState} from 'react'
import BigNumber from 'bignumber.js'
import {ModalProps} from 'antd/lib/modal'
import {DialogApproval} from '../../common/dialog/DialogApproval'
import {DialogMessage} from '../../common/dialog/DialogMessage'
import {Chain} from '../../pob/chains'
import {LunaModal} from '../../common/LunaModal'
import {Dialog} from '../../common/Dialog'
import {DialogInput} from '../../common/dialog/DialogInput'
import {Asset} from './Asset'
import {EstimatedDust} from './EstimatedDust'
import './ClaimWith.scss'

interface ClaimWithKeyProps {
  chain: Chain
  externalAmount: BigNumber
  midnightAmount: BigNumber
  midnightAddress: string
  onNext: (privateKey: string) => void
}

export const ClaimWithKey = ({
  chain,
  externalAmount,
  midnightAmount,
  midnightAddress,
  onNext,
  ...props
}: ClaimWithKeyProps & ModalProps): JSX.Element => {
  const [privateKey, setPrivateKey] = useState<string>('')
  const [checked, setChecked] = useState<boolean>(false)

  const privateKeyError = privateKey.length === 0 ? 'Private Key must be set' : ''
  const disabled = privateKeyError !== '' || !checked

  return (
    <LunaModal destroyOnClose wrapClassName="ClaimWith" {...props}>
      <Dialog
        title="Claim Dust with Private Key"
        rightButtonProps={{
          children: 'Unlock and initiate proof of Work puzzle',
          type: 'default',
          onClick: () => onNext(privateKey),
          disabled,
        }}
        leftButtonProps={{
          doNotRender: true,
        }}
        type="dark"
        buttonDisplayMode="natural"
      >
        <DialogInput
          label={`${chain.symbol} Private Key from your ${chain.symbol} Wallet `}
          onChange={(e): void => setPrivateKey(e.target.value)}
          errorMessage={privateKeyError}
        />
        <Asset amount={externalAmount} chain={chain}>
          Asset
        </Asset>
        <EstimatedDust amount={midnightAmount}>
          Estimated Dust <span className="note">(The minimum amount of Dust you’ll get)</span>
        </EstimatedDust>
        <DialogMessage label="Destination Address" description={midnightAddress} />
        <DialogApproval
          description="I’m aware that I have to keep my Luna wallet open during unlocking "
          checked={checked}
          onChange={setChecked}
        />
      </Dialog>
    </LunaModal>
  )
}
