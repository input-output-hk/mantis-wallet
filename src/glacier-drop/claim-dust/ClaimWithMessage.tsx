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
import {LINKS} from '../../external-link-config'
import {Asset} from './Asset'
import {rendererLog} from '../../common/logger'
import './ClaimWith.scss'

export const INVALID_SIGNED_MESSAGE_TEXT = 'Invalid signed message'
export const MESSAGE_MUST_BE_SET_TEXT = 'Message must be set'

const signedMessageToAuthSignature = (signedMessage: string): AuthorizationSignature => {
  try {
    const {v, r, s} = fromRpcSig(signedMessage)
    return {
      v,
      r: bufferToHex(r),
      s: bufferToHex(s),
    }
  } catch (e) {
    rendererLog.error(e)
    throw Error(INVALID_SIGNED_MESSAGE_TEXT)
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
      helpURL={LINKS.aboutGlacier}
    >
      <DialogInput
        autoFocus
        id="signed-message"
        label={`Input Signed Message`}
        onChange={(e): void => {
          setSignedMessage(e.target.value)
        }}
        formItem={{
          name: 'signed-message',
          rules: [{required: true, message: MESSAGE_MUST_BE_SET_TEXT}],
        }}
      />
      <Asset amount={externalAmount} chain={chain}>
        Asset
      </Asset>
      <DialogShowDust amount={minimumDustAmount}>
        Estimated Dust <span className="note">(The minimum amount of Dust you’ll get)</span>
      </DialogShowDust>
      <DialogMessage label="Destination Address">{transparentAddress}</DialogMessage>
      <DialogApproval id="should-keep-open-checkbox" description={SHOULD_KEEP_OPEN_TEXT} />
    </Dialog>
  )
}

export const ClaimWithMessage = wrapWithModal(_ClaimWithMessage, 'ClaimWith')
