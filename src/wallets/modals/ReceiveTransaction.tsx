import React, {useState, FunctionComponent} from 'react'
import _ from 'lodash/fp'
import {ModalProps} from 'antd/lib/modal'
import {fillActionHandlers} from '../../common/util'
import {LunaModal, ModalLocker} from '../../common/LunaModal'
import {Dialog} from '../../common/Dialog'
import {DialogQRCode} from '../../common/dialog/DialogQRCode'
import {TransparentAddress} from '../../web3'
import {useLocalizedUtilities, useTranslation} from '../../settings-state'
import {DialogTextSwitch} from '../../common/dialog/DialogTextSwitch'
import {CopyableLongText} from '../../common/CopyableLongText'
import {DialogMessage} from '../../common/dialog/DialogMessage'
import {Trans} from '../../common/Trans'
import './ReceiveTransaction.scss'

interface ReceivePrivateTransactionProps {
  privateAddress: string
}

interface ReceivePublicTransactionProps {
  transparentAddress?: TransparentAddress
  onGenerateNew: () => Promise<void>
  onSetLoading: (isLoading: boolean) => void
}

interface ReceiveTransactionProps
  extends ReceivePrivateTransactionProps,
    Pick<ReceivePublicTransactionProps, 'onGenerateNew'> {
  transparentAddresses: TransparentAddress[]
  goToAccounts: () => void
  defaultMode?: 'transparent' | 'confidential'
}

const ReceivePrivateTransaction: FunctionComponent<ReceivePrivateTransactionProps> = ({
  privateAddress,
}: ReceivePrivateTransactionProps) => {
  const {copyToClipboard} = useLocalizedUtilities()
  return (
    <Dialog
      leftButtonProps={{
        children: <Trans k={['wallet', 'button', 'copyAddress']} />,
        autoFocus: true,
        onClick: (): void => {
          copyToClipboard(privateAddress)
        },
      }}
      rightButtonProps={{
        doNotRender: true,
      }}
      type="dark"
    >
      <div className="title">
        <Trans k={['wallet', 'title', 'yourConfidentialAddress']} />
      </div>
      <DialogQRCode content={privateAddress} />
    </Dialog>
  )
}

const ReceivePublicTransaction: FunctionComponent<ReceivePublicTransactionProps> = ({
  transparentAddress,
  onGenerateNew,
  onSetLoading,
}: ReceivePublicTransactionProps) => {
  const modalLocker = ModalLocker.useContainer()
  const {copyToClipboard} = useLocalizedUtilities()

  const title = transparentAddress ? (
    <Trans
      k={['wallet', 'title', 'receiveTransparentAccount']}
      values={{index: transparentAddress.index}}
    />
  ) : (
    <Trans k={['wallet', 'message', 'noKnownTransparentAddresses']} />
  )

  const handleLoading = (isLoading: boolean): void => {
    onSetLoading(isLoading)
    modalLocker.setLocked(isLoading)
  }

  return (
    <Dialog
      leftButtonProps={{
        children: <Trans k={['wallet', 'button', 'copyAddress']} />,
        autoFocus: true,
        onClick: (): void => {
          if (transparentAddress) {
            copyToClipboard(transparentAddress.address)
          }
        },
        disabled: !transparentAddress,
      }}
      rightButtonProps={{
        type: 'default',
        children: <Trans k={['wallet', 'button', 'generateNewTransparentAddressShort']} />,
        onClick: onGenerateNew,
      }}
      onSetLoading={handleLoading}
      type="dark"
    >
      <div className="title">{title}</div>
      {transparentAddress && (
        <>
          <DialogQRCode content={transparentAddress.address} />
          <DialogMessage type="highlight">
            <Trans k={['wallet', 'message', 'transparentAddressWarning']} />
          </DialogMessage>
        </>
      )}
    </Dialog>
  )
}

export const ReceiveTransaction: FunctionComponent<ReceiveTransactionProps & ModalProps> = ({
  privateAddress,
  transparentAddresses,
  onGenerateNew,
  goToAccounts,
  defaultMode = 'confidential',
  ...props
}: ReceiveTransactionProps & ModalProps) => {
  const {t} = useTranslation()
  const [mode, setMode] = useState(defaultMode)
  const [isLoading, setLoading] = useState(false)

  const newestAddress = _.head(transparentAddresses)

  const usedAddresses = mode === 'transparent' &&
    transparentAddresses &&
    transparentAddresses.length > 1 && (
      <div className="ReceiveModalFooter">
        <div className="title">
          <Trans k={['wallet', 'label', 'lastUsedAddresses']} />
        </div>
        {transparentAddresses.slice(1, 6).map(({address}) => (
          <div key={address} className="address">
            <CopyableLongText content={address} showQrCode />
          </div>
        ))}
        {transparentAddresses.length > 6 && (
          <div
            {...fillActionHandlers(() => {
              if (!isLoading) goToAccounts()
            })}
          >
            <span className="link">
              <Trans k={['wallet', 'button', 'seeAllTransparentAddresses']} />
            </span>
          </div>
        )}
      </div>
    )

  return (
    <LunaModal footer={usedAddresses} wrapClassName="ReceiveModal" {...props}>
      <Dialog
        leftButtonProps={{
          doNotRender: true,
        }}
        rightButtonProps={{
          doNotRender: true,
        }}
      >
        <DialogTextSwitch
          buttonClassName="mode-switch"
          defaultMode={mode}
          left={{label: t(['wallet', 'transactionType', 'confidential']), type: 'confidential'}}
          right={{label: t(['wallet', 'transactionType', 'transparent']), type: 'transparent'}}
          onChange={setMode}
        />
      </Dialog>
      {mode === 'confidential' && <ReceivePrivateTransaction privateAddress={privateAddress} />}
      {mode === 'transparent' && (
        <ReceivePublicTransaction
          transparentAddress={newestAddress}
          onGenerateNew={onGenerateNew}
          onSetLoading={setLoading}
        />
      )}
    </LunaModal>
  )
}
