import React, {useState} from 'react'
import _ from 'lodash/fp'
import {ModalProps} from 'antd/lib/modal'
import {LunaModal} from '../../common/LunaModal'
import {Dialog} from '../../common/Dialog'
import {DialogPrivateKey} from '../../common/dialog/DialogPrivateKey'
import {TransparentAddress} from '../../web3'
import {DialogError} from '../../common/dialog/DialogError'
import {useIsMounted} from '../../common/hook-utils'
import {copyToClipboard} from '../../common/clipboard'

interface ReceiveTransactionProps {
  transparentAddresses: TransparentAddress[]
  onGenerateNew: () => Promise<void>
}

export const ReceiveTransaction: React.FunctionComponent<ReceiveTransactionProps & ModalProps> = ({
  transparentAddresses,
  onGenerateNew,
  ...props
}: ReceiveTransactionProps & ModalProps) => {
  const mounted = useIsMounted()
  const [inProgress, setInProgress] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const orderedAddresses = _.orderBy('index', 'desc', transparentAddresses)
  const newestAddress = _.head(orderedAddresses)

  const title = newestAddress ? `Receive Account ${newestAddress.index}` : 'No known addresses'

  const errors = errorMessage && <DialogError>{errorMessage}</DialogError>

  const usedAddresses = orderedAddresses && orderedAddresses.length > 1 && (
    <div className="ReceiveModalFooter">
      <div className="title">Used addresses</div>
      {_.tail(orderedAddresses).map(({address}) => (
        <div key={address} className="address">
          {address}
        </div>
      ))}
    </div>
  )

  return (
    <LunaModal footer={usedAddresses} {...props}>
      <Dialog
        title={title}
        leftButtonProps={{
          children: 'Copy Code',
          onClick: (): void => {
            if (newestAddress) {
              copyToClipboard(newestAddress.address)
            }
          },
          disabled: !newestAddress,
        }}
        rightButtonProps={{
          type: 'default',
          children: 'Generate new →',
          onClick: async (): Promise<void> => {
            if (mounted.current) setInProgress(true)
            try {
              await onGenerateNew()
            } catch (e) {
              if (mounted.current) setErrorMessage(e.message)
            } finally {
              if (mounted.current) setInProgress(false)
            }
          },
          loading: inProgress,
        }}
        type="dark"
        footer={errors}
      >
        {newestAddress && <DialogPrivateKey privateKey={newestAddress.address} />}
      </Dialog>
    </LunaModal>
  )
}
