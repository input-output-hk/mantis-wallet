import React from 'react'
import {Button} from 'antd'
import QRCode from 'qrcode.react'
import fileDownload from 'js-file-download'
import './DialogPrivateKey.scss'

interface DialogPrivateKeyProps {
  privateKey: string
  enableDownload?: boolean
}

export const DialogPrivateKey: React.FunctionComponent<DialogPrivateKeyProps> = ({
  privateKey,
  enableDownload = false,
}: DialogPrivateKeyProps) => (
  <div className="DialogPrivateKey">
    <div className="display">
      <div className="qr-code">
        <QRCode value={privateKey} />
      </div>
      <div className="private-key">{privateKey}</div>
    </div>
    {enableDownload && (
      <Button
        className="download"
        type="primary"
        onClick={(): void => fileDownload(privateKey, 'Download.txt')}
      >
        Download.txt
      </Button>
    )}
  </div>
)
