import React from 'react'
import {Button} from 'antd'
import QRCode from 'qrcode.react'
import fileDownload from 'js-file-download'
import './DialogPrivateKey.scss'

interface DialogPrivateKeyProps {
  privateKey: string
  downloadFileName?: string
}

export const DialogPrivateKey: React.FunctionComponent<DialogPrivateKeyProps> = ({
  privateKey,
  downloadFileName,
}: DialogPrivateKeyProps) => (
  <div className="DialogPrivateKey">
    <div className="display">
      <div className="qr-code">
        <QRCode value={privateKey} />
      </div>
      <div className="private-key">{privateKey}</div>
    </div>
    {downloadFileName && (
      <Button
        className="download"
        type="primary"
        onClick={(): void => fileDownload(privateKey, `${downloadFileName}.txt`)}
      >
        Download.txt
      </Button>
    )}
  </div>
)
