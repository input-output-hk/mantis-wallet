import React, {FunctionComponent} from 'react'
import _ from 'lodash/fp'
import {ModalProps} from 'antd/lib/modal'
import {LunaModal, ModalLocker, ScrollableModalFooter} from '../../common/LunaModal'
import {Dialog} from '../../common/Dialog'
import {DialogQRCode} from '../../common/dialog/DialogQRCode'
import {useLocalizedUtilities} from '../../settings-state'
import {CopyableLongText} from '../../common/CopyableLongText'
import {Trans} from '../../common/Trans'
import {Account} from '../../common/wallet-state'
import './ReceiveTransaction.scss'

type OnGenerateNewCallback = () => Promise<void>

interface ReceiveTransactionProps {
  onGenerateNew: OnGenerateNewCallback
  accounts: Account[]
}

export const ReceiveTransaction: FunctionComponent<ReceiveTransactionProps & ModalProps> = ({
  accounts,
  onGenerateNew,
  ...props
}: ReceiveTransactionProps & ModalProps) => {
  const newestAccount = _.head(accounts)
  if (newestAccount === undefined) throw Error('There must be at least an account')
  const {copyToClipboard} = useLocalizedUtilities()

  // Address List Component
  const usedAddresses = accounts && accounts.length > 1 && (
    <ScrollableModalFooter>
      <div className="footer">
        <div className="title">
          <Trans k={['wallet', 'label', 'lastUsedAddresses']} />
        </div>
        {accounts.slice(1).map(({address}) => (
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
          onClick: (): Promise<void> => copyToClipboard(newestAccount.address),
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
        <DialogQRCode content={newestAccount.address} />
      </Dialog>
    )
  }

  return (
    <LunaModal footer={usedAddresses} wrapClassName="ReceiveModal" {...props}>
      <ReceiveDialog />
    </LunaModal>
  )
}
