import React from 'react'
import {CopyOutlined, QrcodeOutlined} from '@ant-design/icons'
import {Popover} from 'antd'
import QRCode from 'qrcode.react'
import {useTranslation, useLocalizedUtilities} from '../settings-state'
import './CopyableLongText.scss'

interface CopyableLongTextProps {
  content?: string | null
  showQrCode?: boolean
  fallback?: string
}

export const CopyableLongText = ({
  content,
  showQrCode = false,
  fallback = '',
}: CopyableLongTextProps): JSX.Element => {
  const {t} = useTranslation()
  const {copyToClipboard} = useLocalizedUtilities()

  return content ? (
    <div className="CopyableLongText">
      {showQrCode && (
        <Popover
          content={<QRCode value={content} />}
          placement="top"
          overlayClassName="qr-code-popover"
        >
          <QrcodeOutlined className="clickable" />
        </Popover>
      )}
      <Popover content={t(['common', 'message', 'clickToCopy'])} placement="top">
        <CopyOutlined className="clickable" onClick={() => copyToClipboard(content)} />
      </Popover>
      <Popover content={content} placement="top">
        <span>{content}</span>
      </Popover>
    </div>
  ) : (
    <>{fallback}</>
  )
}
