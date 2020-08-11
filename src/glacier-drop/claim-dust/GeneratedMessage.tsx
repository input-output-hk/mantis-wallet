import React from 'react'
import {ModalProps} from 'antd/lib/modal'
import {LunaModal} from '../../common/LunaModal'
import {Dialog} from '../../common/Dialog'
import {DialogInput} from '../../common/dialog/DialogInput'
import {useLocalizedUtilities, useTranslation} from '../../settings-state'
import {Link} from '../../common/Link'
import {LINKS} from '../../external-link-config'
import {normalizeAddress} from '../glacier-state'
import {Trans} from '../../common/Trans'
import './GeneratedMessage.scss'

interface GeneratedMessageProps {
  transparentAddress: string
  externalAddress: string
  onNext: () => void
}

export const GeneratedMessage = ({
  transparentAddress,
  externalAddress,
  onNext,
  ...props
}: GeneratedMessageProps & ModalProps): JSX.Element => {
  const {copyToClipboard} = useLocalizedUtilities()
  const {t} = useTranslation()

  // TODO: get authorization message from an endpoint
  const normalizedEtcAddress = normalizeAddress(externalAddress)
  const msg = `I authorise ${transparentAddress} to get my ${normalizedEtcAddress} GlacierDrop`

  return (
    <LunaModal wrapClassName="GeneratedMessage" {...props}>
      <Dialog
        title={t(['glacierDrop', 'title', 'claimDust'])}
        leftButtonProps={{
          autoFocus: true,
          children: t(['glacierDrop', 'button', 'copyGeneratedMessage']),
          onClick: () => copyToClipboard(msg),
        }}
        rightButtonProps={{
          children: t(['glacierDrop', 'button', 'confirmAuthorization']),
          onClick: () => onNext(),
        }}
        type="dark"
      >
        <DialogInput
          label={t(['glacierDrop', 'label', 'generatedMessage'])}
          value={msg}
          disabled={true}
        />
        <div className="more-info">
          <Link href={LINKS.aboutGlacier}>
            <Trans k={['glacierDrop', 'link', 'viewCompatibleWalletsAndSoftware']} />
          </Link>
        </div>
      </Dialog>
    </LunaModal>
  )
}
