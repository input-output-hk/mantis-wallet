import React from 'react'
import {Icon, Popover} from 'antd'
import QRCode from 'qrcode.react'
import {copyToClipboard} from './clipboard'
import './CopyableLongText.scss'

interface CopyableLongTextProps {
  content?: string | null
  showQrCode?: boolean
}

export const CopyableLongText = ({
  content,
  showQrCode = false,
}: CopyableLongTextProps): JSX.Element =>
  content == null ? (
    <></>
  ) : (
    <div className="CopyableLongText">
      {showQrCode && (
        <Popover content={<QRCode value={content} />} placement="top">
          <Icon type="qrcode" className="clickable" />
        </Popover>
      )}
      <Popover content="Click to copy to clipboard" placement="top">
        <Icon type="copy" className="clickable" onClick={() => copyToClipboard(content)} />
      </Popover>
      <Popover content={content} placement="top">
        {content}
      </Popover>
    </div>
  )
