import React, {useState, FunctionComponent} from 'react'
import _ from 'lodash/fp'
import {ModalProps} from 'antd/lib/modal'
import {LunaModal, ModalLocker} from '../../common/LunaModal'
import {Dialog} from '../../common/Dialog'
import {DialogQRCode} from '../../common/dialog/DialogQRCode'
import {TransparentAddress, PrivateAddress} from '../../web3'
import {useLocalizedUtilities, useTranslation} from '../../settings-state'
import {DialogTextSwitch} from '../../common/dialog/DialogTextSwitch'
import {CopyableLongText} from '../../common/CopyableLongText'
import {DialogMessage} from '../../common/dialog/DialogMessage'
import {Trans} from '../../common/Trans'
import './ReceiveTransaction.scss'

type OnGenerateNewCallback = () => Promise<void>

interface BaseReceiveTabProps {
  onGenerateNew: OnGenerateNewCallback
  newestAddress?: TransparentAddress | PrivateAddress
  onSetLoading: (isLoading: boolean) => void
}

interface ReceivePrivateTabProps extends BaseReceiveTabProps {
  newestAddress: PrivateAddress
}

interface ReceivePublicTabProps extends BaseReceiveTabProps {
  newestAddress?: TransparentAddress
}

interface ReceiveTransactionProps {
  onGenerateNewTransparent: OnGenerateNewCallback
  onGenerateNewPrivate: OnGenerateNewCallback
  transparentAddresses: TransparentAddress[]
  privateAddresses: PrivateAddress[]
  defaultMode?: 'transparent' | 'confidential'
}

const ReceivePrivateTransaction: FunctionComponent<ReceivePrivateTabProps> = ({
  onGenerateNew,
  newestAddress,
  onSetLoading,
}: ReceivePrivateTabProps) => {
  const modalLocker = ModalLocker.useContainer()
  const {copyToClipboard} = useLocalizedUtilities()

  const handleLoading = (isLoading: boolean): void => {
    onSetLoading(isLoading)
    modalLocker.setLocked(isLoading)
  }

  return (
    <Dialog
      leftButtonProps={{
        children: <Trans k={['wallet', 'button', 'copyAddress']} />,
        autoFocus: true,
        onClick: async (): Promise<void> => {
          if (newestAddress) {
            await copyToClipboard(newestAddress.address)
          }
        },
      }}
      rightButtonProps={{
        type: 'default',
        children: <Trans k={['wallet', 'button', 'generateNewAddressShort']} />,
        onClick: onGenerateNew,
      }}
      onSetLoading={handleLoading}
      type="dark"
    >
      <div className="title">
        <Trans k={['wallet', 'title', 'yourConfidentialAddress']} />
      </div>
      <DialogQRCode content={newestAddress.address} />
    </Dialog>
  )
}

const ReceivePublicTransaction: FunctionComponent<ReceivePublicTabProps> = ({
  onGenerateNew,
  newestAddress,
  onSetLoading,
}: ReceivePublicTabProps) => {
  const modalLocker = ModalLocker.useContainer()
  const {copyToClipboard} = useLocalizedUtilities()

  const title = newestAddress ? (
    <Trans
      k={['wallet', 'title', 'receiveTransparentAccount']}
      values={{index: newestAddress.index}}
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
        onClick: async (): Promise<void> => {
          if (newestAddress) {
            await copyToClipboard(newestAddress.address)
          }
        },
        disabled: !newestAddress,
      }}
      rightButtonProps={{
        type: 'default',
        children: <Trans k={['wallet', 'button', 'generateNewAddressShort']} />,
        onClick: onGenerateNew,
      }}
      onSetLoading={handleLoading}
      type="dark"
    >
      <div className="title">{title}</div>
      {newestAddress && (
        <>
          <DialogQRCode content={newestAddress.address} />
          <DialogMessage type="highlight">
            <Trans k={['wallet', 'message', 'transparentAddressWarning']} />
          </DialogMessage>
        </>
      )}
    </Dialog>
  )
}

export const ReceiveTransaction: FunctionComponent<ReceiveTransactionProps & ModalProps> = ({
  transparentAddresses,
  privateAddresses,
  onGenerateNewTransparent,
  onGenerateNewPrivate,
  defaultMode = 'confidential',
  ...props
}: ReceiveTransactionProps & ModalProps) => {
  const {t} = useTranslation()
  const [mode, setMode] = useState(defaultMode)
  const [isLoading, setLoading] = useState(false)

  const addresses = mode === 'transparent' ? transparentAddresses : privateAddresses

  const newestAddress = _.head(addresses)

  // Address List Component
  const usedAddresses = addresses && addresses.length > 1 && (
    <div className="ReceiveModalFooter">
      <div className="title">
        <Trans k={['wallet', 'label', 'lastUsedAddresses']} />
      </div>
      {addresses.slice(1).map(({address}) => (
        <div key={address} className="address">
          <CopyableLongText content={address} showQrCode />
        </div>
      ))}
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
          left={{label: t(['wallet', 'transactionType', 'transparent']), type: 'transparent'}}
          right={{label: t(['wallet', 'transactionType', 'confidential']), type: 'confidential'}}
          onChange={setMode}
          disabled={isLoading}
        />
      </Dialog>
      {mode === 'confidential' && (
        <ReceivePrivateTransaction
          newestAddress={newestAddress as PrivateAddress} // There's always at least one private address in the array
          onGenerateNew={onGenerateNewPrivate}
          onSetLoading={setLoading}
        />
      )}
      {mode === 'transparent' && (
        <ReceivePublicTransaction
          newestAddress={newestAddress}
          onGenerateNew={onGenerateNewTransparent}
          onSetLoading={setLoading}
        />
      )}
    </LunaModal>
  )
}
