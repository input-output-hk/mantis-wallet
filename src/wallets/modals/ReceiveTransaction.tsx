import React from 'react'
import _ from 'lodash/fp'
import {ModalProps} from 'antd/lib/modal'
import {MantisModal, ModalLocker} from '../../common/MantisModal'
import {Dialog} from '../../common/Dialog'
import {DialogQRCode} from '../../common/dialog/DialogQRCode'
import {useLocalizedUtilities} from '../../settings-state'
import {Trans} from '../../common/Trans'
import {Account} from '../../common/wallet-state'
import './ReceiveTransaction.scss'

type OnGenerateNewCallback = () => Promise<void>

interface ReceiveDialogProps {
  onGenerateNew: OnGenerateNewCallback
  newestAccount: Account
}

const ReceiveDialog = ({newestAccount, onGenerateNew}: ReceiveDialogProps): JSX.Element => {
  const {copyToClipboard} = useLocalizedUtilities()
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
        doNotRender: true, // FIXME: ETCM-58
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
interface ReceiveTransactionProps {
  onGenerateNew: OnGenerateNewCallback
  accounts: Account[]
}

export const ReceiveTransaction = ({
  accounts,
  onGenerateNew,
  ...props
}: ReceiveTransactionProps & ModalProps): JSX.Element => {
  const newestAccount = _.head(accounts)
  if (newestAccount === undefined) throw Error('There must be at least an account')

  // FIXME: ETCM-58
  // Address List Component
  // const usedAddresses = accounts && accounts.length > 1 && (
  //   <ScrollableModalFooter>
  //     <div className="footer">
  //       <div className="title">
  //         <Trans k={['wallet', 'label', 'lastUsedAddresses']} />
  //       </div>
  //       {accounts.slice(1).map(({address}) => (
  //         <div key={address} className="address">
  //           <CopyableLongText content={address} showQrCode />
  //         </div>
  //       ))}
  //     </div>
  //   </ScrollableModalFooter>
  // )

  return (
    <MantisModal
      // FIXME: ETCM-58
      // footer={usedAddresses}
      wrapClassName="ReceiveModal"
      {...props}
    >
      <ReceiveDialog newestAccount={newestAccount} onGenerateNew={onGenerateNew} />
    </MantisModal>
  )
}
