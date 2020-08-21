import React, {FunctionComponent} from 'react'
import {wrapWithModal, ModalOnCancel} from '../../common/LunaModal'
import {Dialog} from '../../common/Dialog'
import {Token} from '../tokens-state'
import {DialogMessage} from '../../common/dialog/DialogMessage'
import {Trans} from '../../common/Trans'

interface HideTokenModalProps extends ModalOnCancel {
  onHideToken: (token: Token) => void
  token: Token
}

const HideTokenDialog: FunctionComponent<HideTokenModalProps> = ({
  onHideToken,
  token,
  onCancel,
}: HideTokenModalProps) => (
  <Dialog
    title={<Trans k={['tokens', 'title', 'hideToken']} values={{tokenSymbol: token.symbol}} />}
    leftButtonProps={{
      onClick: onCancel,
    }}
    rightButtonProps={{
      children: <Trans k={['tokens', 'button', 'proceedHidingToken']} />,
      onClick: () => onHideToken(token),
    }}
  >
    <DialogMessage type="highlight">
      <Trans k={['tokens', 'message', 'hideTokenMessage']} />
    </DialogMessage>
  </Dialog>
)

export const HideTokenModal = wrapWithModal(HideTokenDialog)
