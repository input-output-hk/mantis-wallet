import React, {FunctionComponent} from 'react'
import classnames from 'classnames'
import {Button} from 'antd'
import QRCode from 'qrcode.react'
import fileDownload from 'js-file-download'
import './DialogQRCode.scss'

interface DialogQRCodeProps {
  content: string
  downloadFileName?: string
  blurred?: boolean
}

export const DialogQRCode: FunctionComponent<DialogQRCodeProps> = ({
  content,
  downloadFileName,
  blurred = false,
}: DialogQRCodeProps) => (
  <div className={classnames('DialogQRCode', {blurred})}>
    <div className="display">
      <div className="qr-code">
        <QRCode data-testid="qr-code" value={content} />
      </div>
      <div className="qr-content">{content}</div>
    </div>
    {downloadFileName && (
      <div className="actions grid">
        <Button
          className="download"
          type="primary"
          onClick={(): void => fileDownload(content, `${downloadFileName}.txt`)}
        >
          Download txt
        </Button>
      </div>
    )}
  </div>
)
