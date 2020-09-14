import React, {FunctionComponent} from 'react'
import _ from 'lodash/fp'
import {ModalProps} from 'antd/lib/modal'
import {LunaModal, ModalLocker, ScrollableModalFooter} from '../../common/LunaModal'
import {Dialog} from '../../common/Dialog'
import {DialogQRCode} from '../../common/dialog/DialogQRCode'
import {PrivateAddress} from '../../web3'
import {useLocalizedUtilities} from '../../settings-state'
import {CopyableLongText} from '../../common/CopyableLongText'
import {Trans} from '../../common/Trans'
import './ReceiveTransaction.scss'

type OnGenerateNewCallback = () => Promise<void>

interface ReceiveTransactionProps {
  onGenerateNew: OnGenerateNewCallback
  addresses: PrivateAddress[]
}

export const ReceiveTransaction: FunctionComponent<ReceiveTransactionProps & ModalProps> = ({
  addresses,
  onGenerateNew,
  ...props
}: ReceiveTransactionProps & ModalProps) => {
  const newestAddress = _.head(addresses) as PrivateAddress
  const {copyToClipboard} = useLocalizedUtilities()

  // Address List Component
  const usedAddresses = addresses && addresses.length > 1 && (
    <ScrollableModalFooter>
      <div className="footer">
        <div className="title">
          <Trans k={['wallet', 'label', 'lastUsedAddresses']} />
        </div>
        {addresses.slice(1).map(({address}) => (
          <div key={address} className="address">
            <CopyableLongText content={address} showQrCode />
          </div>
        ))}
      </div>
    </ScrollableModalFooter>
  )

  const ReceiveDialog = (): JSX.Element => {
    const modalLocker = ModalLocker.useContainer()
    const handleLoading = (isLoading: boolean): void => {
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
          <Trans k={['wallet', 'title', 'yourAddress']} />
        </div>
        <DialogQRCode content={newestAddress.address} />
      </Dialog>
    )
  }

  return (
    <LunaModal footer={usedAddresses} wrapClassName="ReceiveModal" {...props}>
      <ReceiveDialog />
    </LunaModal>
  )
}
