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

interface ClaimWithMessageProps {
  chain: Chain
  externalAmount: BigNumber
  midnightAmount: BigNumber
  midnightAddress: string
  onNext: (signedMessage: string) => void
}

export const ClaimWithMessage = ({
  chain,
  externalAmount,
  midnightAmount,
  midnightAddress,
  onNext,
  ...props
}: ClaimWithMessageProps & ModalProps): JSX.Element => {
  const [signedMessage, setSignedMessage] = useState<string>('')
  const [checked, setChecked] = useState<boolean>(false)

  const signedMessageError = signedMessage.length === 0 ? 'Message must be set' : ''
  const disabled = signedMessageError !== '' || !checked

  return (
    <LunaModal destroyOnClose wrapClassName="ClaimWith" {...props}>
      <Dialog
        title="Claim Dust with Signed Message"
        rightButtonProps={{
          children: 'Unlock and initiate proof of Work puzzle',
          type: 'default',
          onClick: () => onNext(signedMessage),
          disabled,
        }}
        leftButtonProps={{
          doNotRender: true,
        }}
        type="dark"
        buttonDisplayMode="natural"
      >
        <DialogInput
          label={`Input Signed Message`}
          onChange={(e): void => setSignedMessage(e.target.value)}
          errorMessage={signedMessageError}
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
