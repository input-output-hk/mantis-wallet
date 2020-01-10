import React from 'react'
import {Button} from 'antd'
import QRCode from 'qrcode.react'
import fileDownload from 'js-file-download'
import './WalletDialogPrivateKey.scss'

interface WalletDialogPrivateKeyProps {
  privateKey: string
}

export const WalletDialogPrivateKey: React.FunctionComponent<WalletDialogPrivateKeyProps> = ({
  privateKey,
}: WalletDialogPrivateKeyProps) => (
  <div className="WalletDialogPrivateKey">
    <div className="display">
      <div className="qr-code">
        <QRCode value={privateKey} />
      </div>
      <div className="private-key">{privateKey}</div>
    </div>
    <Button
      className="download"
      type="primary"
      onClick={(): void => fileDownload(privateKey, 'Download.txt')}
    >
      Download.txt
    </Button>
  </div>
)
