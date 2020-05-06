import React, {useState} from 'react'
import _ from 'lodash/fp'
import {ModalProps} from 'antd/lib/modal'
import {LunaModal, ModalLocker} from '../../common/LunaModal'
import {Dialog} from '../../common/Dialog'
import {DialogPrivateKey} from '../../common/dialog/DialogPrivateKey'
import {TransparentAddress} from '../../web3'
import {copyToClipboard} from '../../common/clipboard'
import {DialogTextSwitch} from '../../common/dialog/DialogTextSwitch'
import {CopyableLongText} from '../../common/CopyableLongText'
import {DialogMessage} from '../../common/dialog/DialogMessage'
import './ReceiveTransaction.scss'

interface ReceivePrivateTransactionProps {
  privateAddress: string
}

interface ReceivePublicTransactionProps {
  transparentAddress?: TransparentAddress
  onGenerateNew: () => Promise<void>
}

interface ReceiveTransactionProps
  extends ReceivePrivateTransactionProps,
    Pick<ReceivePublicTransactionProps, 'onGenerateNew'> {
  transparentAddresses: TransparentAddress[]
  goToAccounts: () => void
}

const ReceivePrivateTransaction: React.FunctionComponent<ReceivePrivateTransactionProps> = ({
  privateAddress,
}: ReceivePrivateTransactionProps) => (
  <Dialog
    leftButtonProps={{
      children: 'Copy Code',
      onClick: (): void => {
        copyToClipboard(privateAddress)
      },
    }}
    rightButtonProps={{
      doNotRender: true,
    }}
    type="dark"
  >
    <div className="title">Your private address</div>
    <DialogPrivateKey privateKey={privateAddress} />
  </Dialog>
)

const ReceivePublicTransaction: React.FunctionComponent<ReceivePublicTransactionProps> = ({
  transparentAddress,
  onGenerateNew,
}: ReceivePublicTransactionProps) => {
  const modalLocker = ModalLocker.useContainer()

  const title = transparentAddress
    ? `Receive Account ${transparentAddress.index}`
    : 'No known addresses'

  return (
    <Dialog
      leftButtonProps={{
        children: 'Copy Code',
        onClick: (): void => {
          if (transparentAddress) {
            copyToClipboard(transparentAddress.address)
          }
        },
        disabled: !transparentAddress,
      }}
      rightButtonProps={{
        type: 'default',
        children: 'Generate new →',
        onClick: onGenerateNew,
      }}
      onSetLoading={modalLocker.setLocked}
      type="dark"
    >
      <div className="title">{title}</div>
      {transparentAddress && (
        <>
          <DialogPrivateKey privateKey={transparentAddress.address} />
          <DialogMessage
            description={
              <>
                <b>Warning:</b> By using a transparent address your transaction will not stay
                confidential.
              </>
            }
            type="highlight"
          />
        </>
      )}
    </Dialog>
  )
}

export const ReceiveTransaction: React.FunctionComponent<ReceiveTransactionProps & ModalProps> = ({
  privateAddress,
  transparentAddresses,
  onGenerateNew,
  goToAccounts,
  ...props
}: ReceiveTransactionProps & ModalProps) => {
  const [mode, setMode] = useState<'transparent' | 'confidential'>('confidential')

  const newestAddress = _.head(transparentAddresses)

  const usedAddresses = mode === 'transparent' &&
    transparentAddresses &&
    transparentAddresses.length > 1 && (
      <div className="ReceiveModalFooter">
        <div className="title">Last Used addresses</div>
        {transparentAddresses.slice(1, 6).map(({address}) => (
          <div key={address} className="address">
            <CopyableLongText content={address} showQrCode />
          </div>
        ))}
        <div
          onClick={() => {
            const modalLocker = ModalLocker.useContainer()
            if (!modalLocker.isLocked) goToAccounts()
          }}
        >
          <span className="link">See all Transparent Addresseses</span>
        </div>
      </div>
    )

  return (
    <LunaModal footer={usedAddresses} {...props}>
      <Dialog
        leftButtonProps={{
          doNotRender: true,
        }}
        rightButtonProps={{
          doNotRender: true,
        }}
      >
        <DialogTextSwitch
          defaultMode={mode}
          left={{label: 'Confidential', type: 'confidential'}}
          right={{label: 'Transparent', type: 'transparent'}}
          onChange={setMode}
        />
      </Dialog>
      {mode === 'confidential' && <ReceivePrivateTransaction privateAddress={privateAddress} />}
      {mode === 'transparent' && (
        <ReceivePublicTransaction
          transparentAddress={newestAddress}
          onGenerateNew={onGenerateNew}
        />
      )}
    </LunaModal>
  )
}
