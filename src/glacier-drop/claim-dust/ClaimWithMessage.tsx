import React, {useState} from 'react'
import BigNumber from 'bignumber.js'
import {fromRpcSig, bufferToHex} from 'ethereumjs-util'
import {ETC_CHAIN} from '../glacier-config'
import {AuthorizationSignature} from '../glacier-state'
import {UNLOCK_BUTTON_TEXT, SHOULD_KEEP_OPEN_TEXT} from './claim-with-strings'
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

  return (
    <Dialog
      title="Claim Dust with Signed Message"
      rightButtonProps={{
        children: UNLOCK_BUTTON_TEXT,
        type: 'default',
        onClick: () => {
          const authSignature = signedMessageToAuthSignature(signedMessage)
          onNext(authSignature)
        },
      }}
      leftButtonProps={{
        doNotRender: true,
      }}
      type="dark"
      buttonDisplayMode="wide"
    >
      <DialogInput
        autoFocus
        label={`Input Signed Message`}
        onChange={(e): void => {
          setSignedMessage(e.target.value)
        }}
        formItem={{
          name: 'signed-message',
          rules: [{required: true, message: 'Message must be set'}],
        }}
      />
      <Asset amount={externalAmount} chain={chain}>
        Asset
      </Asset>
      <DialogShowDust amount={minimumDustAmount}>
        Estimated Dust <span className="note">(The minimum amount of Dust you’ll get)</span>
      </DialogShowDust>
      <DialogMessage label="Destination Address" description={transparentAddress} />
      <DialogApproval id="should-keep-open-checkbox" description={SHOULD_KEEP_OPEN_TEXT} />
    </Dialog>
  )
}

export const ClaimWithMessage = wrapWithModal(_ClaimWithMessage, 'ClaimWith')
