import React, {useState} from 'react'
import BigNumber from 'bignumber.js'
import {fromRpcSig, bufferToHex} from 'ethereumjs-util'
import {ModalProps} from 'antd/lib/modal'
import {ETC_CHAIN} from '../glacier-config'
import {AuthorizationSignature} from '../glacier-state'
import {DialogApproval} from '../../common/dialog/DialogApproval'
import {DialogMessage} from '../../common/dialog/DialogMessage'
import {DisplayChain} from '../../pob/chains'
import {LunaModal} from '../../common/LunaModal'
import {Dialog} from '../../common/Dialog'
import {DialogInput} from '../../common/dialog/DialogInput'
import {DialogShowDust} from '../../common/dialog/DialogShowDust'
import {DialogError} from '../../common/dialog/DialogError'
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
  dustAmount: BigNumber
  transparentAddress: string
  onNext: (authSignature: AuthorizationSignature) => void
  onCancel: () => void
  chain?: DisplayChain
}

export const ClaimWithMessage = ({
  externalAmount,
  dustAmount,
  transparentAddress,
  onNext,
  onCancel,
  chain = ETC_CHAIN,
  ...props
}: ClaimWithMessageProps & ModalProps): JSX.Element => {
  const [signedMessage, setSignedMessage] = useState<string>('')
  const [checked, setChecked] = useState<boolean>(false)

  const [globalErrorMsg, setGlobalErrorMsg] = useState<string>('')
  const globalErrorElem = globalErrorMsg && <DialogError>{globalErrorMsg}</DialogError>

  const signedMessageError = signedMessage.length === 0 ? 'Message must be set' : ''
  const disabled = signedMessageError !== '' || !checked

  const reset = (): void => {
    setGlobalErrorMsg('')
    setChecked(false)
    setSignedMessage('')
  }

  const close = (): void => {
    reset()
    onCancel()
  }

  return (
    <LunaModal destroyOnClose wrapClassName="ClaimWith" onCancel={close} {...props}>
      <Dialog
        title="Claim Dust with Signed Message"
        rightButtonProps={{
          children: 'Unlock and initiate proof of Work puzzle',
          type: 'default',
          onClick: () => {
            try {
              const authSignature = signedMessageToAuthSignature(signedMessage)
              reset()
              onNext(authSignature)
            } catch (e) {
              setGlobalErrorMsg(e.message)
            }
          },
          disabled,
        }}
        leftButtonProps={{
          doNotRender: true,
        }}
        type="dark"
        buttonDisplayMode="natural"
        footer={globalErrorElem}
      >
        <DialogInput
          label={`Input Signed Message`}
          onChange={(e): void => {
            setGlobalErrorMsg('')
            setSignedMessage(e.target.value)
          }}
          errorMessage={signedMessageError}
        />
        <Asset amount={externalAmount} chain={chain}>
          Asset
        </Asset>
        <DialogShowDust amount={dustAmount}>
          Estimated Dust <span className="note">(The minimum amount of Dust you’ll get)</span>
        </DialogShowDust>
        <DialogMessage label="Destination Address" description={transparentAddress} />
        <DialogApproval
          description="I’m aware that I have to keep my Luna wallet open during unlocking "
          checked={checked}
          onChange={setChecked}
        />
      </Dialog>
    </LunaModal>
  )
}
