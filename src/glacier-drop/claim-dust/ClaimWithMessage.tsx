import React, {useState} from 'react'
import BigNumber from 'bignumber.js'
import {fromRpcSig, bufferToHex} from 'ethereumjs-util'
import {AuthorizationSignature} from '../glacier-state'
import {DialogApproval} from '../../common/dialog/DialogApproval'
import {DialogMessage} from '../../common/dialog/DialogMessage'
import {GdChain, ETC_CHAIN} from '../gd-chains'
import {wrapWithModal} from '../../common/LunaModal'
import {Dialog} from '../../common/Dialog'
import {DialogInput} from '../../common/dialog/DialogInput'
import {DialogShowDust} from '../../common/dialog/DialogShowDust'
import {LINKS} from '../../external-link-config'
import {Asset} from './Asset'
import {rendererLog} from '../../common/logger'
import {useTranslation} from '../../settings-state'
import {createTErrorRenderer} from '../../common/i18n'
import {Trans} from '../../common/Trans'
import './ClaimWith.scss'

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
    throw createTErrorRenderer(['glacierDrop', 'error', 'invalidSignedMessage'])
  }
}

interface ClaimWithMessageProps {
  externalAmount: BigNumber
  minimumDustAmount: BigNumber
  transparentAddress: string
  onNext: (authSignature: AuthorizationSignature) => void
  chain?: GdChain
}

const _ClaimWithMessage = ({
  externalAmount,
  minimumDustAmount,
  transparentAddress,
  onNext,
  chain = ETC_CHAIN,
}: ClaimWithMessageProps): JSX.Element => {
  const {t} = useTranslation()
  const [signedMessage, setSignedMessage] = useState<string>('')

  return (
    <Dialog
      title={t(['glacierDrop', 'title', 'claimDustWithSignedMessage'])}
      rightButtonProps={{
        children: t(['glacierDrop', 'button', 'unlockAndInitiatePoW']),
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
        label={t(['glacierDrop', 'label', 'inputSignedMessage'])}
        onChange={(e): void => {
          setSignedMessage(e.target.value)
        }}
        formItem={{
          name: 'signed-message',
          rules: [{required: true, message: t(['glacierDrop', 'error', 'signedMessageMustBeSet'])}],
        }}
      />
      <Asset amount={externalAmount} chain={chain}>
        <Trans k={['glacierDrop', 'label', 'asset']} />
      </Asset>
      <DialogShowDust amount={minimumDustAmount}>
        <Trans k={['glacierDrop', 'label', 'estimatedDust']} />{' '}
        <span className="note">
          (<Trans k={['glacierDrop', 'message', 'estimatedDustNote']} />)
        </span>
      </DialogShowDust>
      <DialogMessage label="Destination Address">{transparentAddress}</DialogMessage>
      <DialogApproval
        id="should-keep-open-checkbox"
        description={t(['glacierDrop', 'message', 'shouldKeepLunaOpenWhileUnlocking'])}
      />
    </Dialog>
  )
}

export const ClaimWithMessage = wrapWithModal(_ClaimWithMessage, 'ClaimWith')
