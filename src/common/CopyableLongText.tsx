import React from 'react'
import classnames from 'classnames'
import {CopyOutlined, QrcodeOutlined} from '@ant-design/icons'
import {Popover} from 'antd'
import QRCode from 'qrcode.react'
import {useTranslation, useLocalizedUtilities} from './store/settings'
import './CopyableLongText.scss'

interface CopyableLongTextProps {
  content?: string | null
  showQrCode?: boolean
  fallback?: string
  className?: string
}

export const CopyableLongText = ({
  content,
  showQrCode = false,
  fallback = '',
  className,
}: CopyableLongTextProps): JSX.Element => {
  const {t} = useTranslation()
  const {copyToClipboard} = useLocalizedUtilities()

  return content ? (
    <div className={classnames('CopyableLongText', className)}>
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
