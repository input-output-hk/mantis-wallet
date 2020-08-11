import React from 'react'
import {ModalProps} from 'antd/lib/modal'
import {Button} from 'antd'
import {Chain, ETC_CHAIN} from '../../common/chains'
import {LunaModal} from '../../common/LunaModal'
import {Dialog} from '../../common/Dialog'
import {Link} from '../../common/Link'
import {LINKS} from '../../external-link-config'
import {DialogColumns} from '../../common/dialog/DialogColumns'
import './SelectMethod.scss'

interface SelectMethodProps {
  onPrivateKey: () => void
  onMessageCreate: () => void
  onMessageUseSigned: () => void
  chain?: Chain
}

export const SelectMethod = ({
  onPrivateKey,
  onMessageCreate,
  onMessageUseSigned,
  chain = ETC_CHAIN,
  ...props
}: SelectMethodProps & ModalProps): JSX.Element => {
  return (
    <LunaModal wrapClassName="SelectMethod" {...props}>
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
          <DialogColumns>
            <Button autoFocus size="large" onClick={onPrivateKey}>
              Continue
            </Button>
          </DialogColumns>
          <DialogColumns>
            <div className="more-info">
              <Link href={LINKS.aboutGlacier}>read more on website</Link>
            </div>
          </DialogColumns>
        </div>
        <div className="section">
          <div className="label">Messages</div>
          <DialogColumns>
            <Button size="large" onClick={onMessageCreate}>
              Create
            </Button>
            <Button size="large" onClick={onMessageUseSigned}>
              Use Signed
            </Button>
          </DialogColumns>
        </div>
      </Dialog>
    </LunaModal>
  )
}
