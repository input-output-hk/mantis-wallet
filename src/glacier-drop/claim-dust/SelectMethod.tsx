import React from 'react'
import {ModalProps} from 'antd/lib/modal'
import {Button} from 'antd'
import {LunaModal} from '../../common/LunaModal'
import {Dialog} from '../../common/Dialog'
import {Chain} from '../../pob/chains'
import './SelectMethod.scss'

interface SelectMethodProps {
  chain: Chain
  onPrivateKey: () => void
  onMessageCreate: () => void
  onMessageUseSigned: () => void
}

export const SelectMethod = ({
  chain,
  onPrivateKey,
  onMessageCreate,
  onMessageUseSigned,
  ...props
}: SelectMethodProps & ModalProps): JSX.Element => {
  return (
    <LunaModal destroyOnClose wrapClassName="SelectMethod" {...props}>
      <Dialog
        title="Claim Dust"
        rightButtonProps={{
          doNotRender: true,
        }}
        leftButtonProps={{
          doNotRender: true,
        }}
        type="dark"
      >
        <div className="message">
          You can register for Dust using two methods. Please, select the most appropriate for you.
        </div>
        <div className="section">
          <div className="label">{chain.symbol} Private Key</div>
          <div className="actions grid">
            <Button size="large" onClick={onPrivateKey}>
              Continue
            </Button>
          </div>
          <div className="actions grid">
            <div className="more-info">read more on website</div>
          </div>
        </div>
        <div className="section">
          <div className="label">Messages</div>
          <div className="actions grid">
            <Button size="large" onClick={onMessageCreate}>
              Create
            </Button>
            <Button size="large" onClick={onMessageUseSigned}>
              Use Signed
            </Button>
          </div>
        </div>
      </Dialog>
    </LunaModal>
  )
}
