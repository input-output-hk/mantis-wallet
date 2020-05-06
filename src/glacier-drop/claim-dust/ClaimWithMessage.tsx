import React, {useState} from 'react'
import BigNumber from 'bignumber.js'
import {fromRpcSig, bufferToHex} from 'ethereumjs-util'
import {ETC_CHAIN} from '../glacier-config'
import {AuthorizationSignature} from '../glacier-state'
import {DialogApproval} from '../../common/dialog/DialogApproval'
import {DialogMessage} from '../../common/dialog/DialogMessage'
import {DisplayChain} from '../../pob/chains'
import {wrapWithModal} from '../../common/LunaModal'
import {Dialog} from '../../common/Dialog'
import {DialogInput} from '../../common/dialog/DialogInput'
import {DialogShowDust} from '../../common/dialog/DialogShowDust'
import {Asset} from './Asset'
import './ClaimWith.scss'

const signedMessageToAuthSignature = (signedMessage: string): AuthorizationSignature => {
  const {v, r, s} = fromRpcSig(signedMessage)
  return {
    v,
    r: bufferToHex(r),
    s: bufferToHex(s),
  }
}

interface ClaimWithMessageProps {
  externalAmount: BigNumber
  minimumDustAmount: BigNumber
  transparentAddress: string
  onNext: (authSignature: AuthorizationSignature) => void
  chain?: DisplayChain
}

const _ClaimWithMessage = ({
  externalAmount,
  minimumDustAmount,
  transparentAddress,
  onNext,
  chain = ETC_CHAIN,
}: ClaimWithMessageProps): JSX.Element => {
  const [signedMessage, setSignedMessage] = useState<string>('')
  const [checked, setChecked] = useState<boolean>(false)

  const signedMessageError = signedMessage.length === 0 ? 'Message must be set' : ''
  const disabled = signedMessageError !== '' || !checked

  return (
    <Dialog
      title="Claim Dust with Signed Message"
      rightButtonProps={{
        children: 'Unlock and initiate proof of Work puzzle',
        type: 'default',
        onClick: () => {
          const authSignature = signedMessageToAuthSignature(signedMessage)
          onNext(authSignature)
        },
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
        onChange={(e): void => {
          setSignedMessage(e.target.value)
        }}
        errorMessage={signedMessageError}
      />
      <Asset amount={externalAmount} chain={chain}>
        Asset
      </Asset>
      <DialogShowDust amount={minimumDustAmount}>
        Estimated Dust <span className="note">(The minimum amount of Dust you’ll get)</span>
      </DialogShowDust>
      <DialogMessage label="Destination Address" description={transparentAddress} />
      <DialogApproval
        description="I’m aware that I have to keep my Luna wallet open during unlocking "
        checked={checked}
        onChange={setChecked}
      />
    </Dialog>
  )
}

export const ClaimWithMessage = wrapWithModal(_ClaimWithMessage, 'ClaimWith')
