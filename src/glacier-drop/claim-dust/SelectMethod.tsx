import React from 'react'
import {ModalProps} from 'antd/lib/modal'
import {Button} from 'antd'
import {GdChain, ETC_CHAIN} from '../gd-chains'
import {LunaModal} from '../../common/LunaModal'
import {Dialog} from '../../common/Dialog'
import {Link} from '../../common/Link'
import {LINKS} from '../../external-link-config'
import {DialogColumns} from '../../common/dialog/DialogColumns'
import {Trans} from '../../common/Trans'
import './SelectMethod.scss'

interface SelectMethodProps {
  onPrivateKey: () => void
  onMessageCreate: () => void
  onMessageUseSigned: () => void
  chain?: GdChain
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
        title={<Trans k={['glacierDrop', 'title', 'claimDust']} />}
        rightButtonProps={{
          doNotRender: true,
        }}
        leftButtonProps={{
          doNotRender: true,
        }}
        type="dark"
      >
        <div className="message">
          <Trans k={['glacierDrop', 'message', 'registerForDustMessage']} />
        </div>
        <div className="section">
          <div className="label">
            <Trans k={chain.translations.privateKeyLabel} />
          </div>
          <DialogColumns>
            <Button autoFocus size="large" onClick={onPrivateKey}>
              <Trans k={['glacierDrop', 'button', 'continueWithPrivateKey']} />
            </Button>
          </DialogColumns>
          <DialogColumns>
            <div className="more-info">
              <Link href={LINKS.aboutGlacier}>
                <Trans k={['glacierDrop', 'link', 'readMoreAboutGlacierDrop']} />
              </Link>
            </div>
          </DialogColumns>
        </div>
        <div className="section">
          <div className="label">
            <Trans k={['glacierDrop', 'label', 'signedMessages']} />
          </div>
          <DialogColumns>
            <Button size="large" onClick={onMessageCreate}>
              <Trans k={['glacierDrop', 'button', 'createMessage']} />
            </Button>
            <Button size="large" onClick={onMessageUseSigned}>
              <Trans k={['glacierDrop', 'button', 'useSignedMessage']} />
            </Button>
          </DialogColumns>
        </div>
      </Dialog>
    </LunaModal>
  )
}
