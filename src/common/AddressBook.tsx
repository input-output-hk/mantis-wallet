import {Button, message, Popover} from 'antd'
import React, {useState} from 'react'
import {EmptyProps} from 'antd/lib/empty'
import {CopyOutlined, DeleteOutlined, EditOutlined} from '@ant-design/icons'
import {Trans} from './Trans'
import {useLocalizedUtilities, useTranslation} from '../settings-state'
import {Dialog} from './Dialog'
import {DialogInput} from './dialog/DialogInput'
import {DialogMessage} from './dialog/DialogMessage'
import {ModalLocker, wrapWithModal} from './LunaModal'
import {fillActionHandlers, toAntValidator, validateAddress} from './util'
import {LoadedState} from './wallet-state'
import {PropsWithWalletState, withStatusGuard} from './wallet-status-guard'
import './AddressBook.scss'

type Setter<T> = React.Dispatch<React.SetStateAction<T>>

interface EditContactModalProps {
  onSave(address: string, label: string): void
  onCancel(): void
  address: string
  label: string
  setAddress: Setter<string>
  setLabel: Setter<string>
  toEdit: boolean
}

const _EditContactModal = ({
  onSave,
  onCancel,
  address,
  label,
  setAddress,
  setLabel,
  toEdit,
}: EditContactModalProps): JSX.Element => {
  const {t} = useTranslation()
  const addressValidator = toAntValidator(t, validateAddress)
  const modalLocker = ModalLocker.useContainer()

  return (
    <Dialog
      title={t(['addressBook', 'book', 'editContact'])}
      leftButtonProps={{
        onClick: onCancel,
        disabled: modalLocker.isLocked,
      }}
      rightButtonProps={{
        children: t(['addressBook', 'book', 'saveContact']),
        disabled: !address || !label || modalLocker.isLocked,
        onClick: (): void => {
          onSave(address, label)
          onCancel()
        },
      }}
      onSetLoading={modalLocker.setLocked}
      initialValues={{
        address: address,
        label: label,
      }}
    >
      <DialogInput
        label={t(['addressBook', 'label', 'address'])}
        onChange={(e): void => setAddress(e.target.value)}
        formItem={{
          name: 'address',
          rules: [
            {required: true, message: t(['addressBook', 'error', 'addressMustBeSet'])},
            addressValidator,
          ],
        }}
        disabled={toEdit}
      />
      <DialogInput
        label={t(['addressBook', 'label', 'label'])}
        onChange={(e): void => setLabel(e.target.value)}
        formItem={{
          name: 'label',
          rules: [{required: true, message: t(['addressBook', 'error', 'labelMustBeSet'])}],
        }}
      />
    </Dialog>
  )
}

interface DeleteContactModalProps {
  onDelete(address: string): void
  onCancel(): void
  address: string
  label: string
}

const _DeleteContactModal = ({
  onDelete,
  onCancel,
  address,
  label,
}: DeleteContactModalProps): JSX.Element => {
  const {t} = useTranslation()

  return (
    <Dialog
      title={t(['addressBook', 'book', 'deleteContact'])}
      leftButtonProps={{
        onClick: onCancel,
      }}
      rightButtonProps={{
        children: t(['addressBook', 'book', 'deleteContactBtn']),
        onClick: (): void => {
          onDelete(address)
          onCancel()
        },
      }}
    >
      <DialogMessage>
        <Trans k={['addressBook', 'book', 'deleteContactWarning']} values={{label, address}} />
      </DialogMessage>
    </Dialog>
  )
}

const DeleteContactModal = wrapWithModal(_DeleteContactModal)
const EditContactModal = wrapWithModal(_EditContactModal)

type ModalId = 'Edit' | 'Delete' | 'none'

const _AddressBook = ({
  walletState: {addressLabels, setAddressLabel, deleteAddressLabel},
}: PropsWithWalletState<EmptyProps, LoadedState>): JSX.Element => {
  const {t} = useTranslation()
  const {copyToClipboard} = useLocalizedUtilities()

  const [shownModal, setShownModal] = useState<ModalId>('none')
  const [toEdit, setToEdit] = useState(false)
  const [selectedAddress, setAddress] = useState('')
  const [selectedLabel, setLabel] = useState('')
  // eslint-disable-next-line fp/no-mutating-methods
  const sortedLabels = [...Object.keys(addressLabels)].sort()

  const onStartEdit = (address: string, label: string) => () => {
    setAddress(address)
    setLabel(label)
    setShownModal('Edit')
    setToEdit(true)
  }

  const onStartAddNew = (): void => {
    setAddress('')
    setLabel('')
    setShownModal('Edit')
    setToEdit(false)
  }

  const onStartDelete = (address: string, label: string) => () => {
    setAddress(address)
    setLabel(label)
    setShownModal('Delete')
  }

  const onDelete = (): void => {
    deleteAddressLabel(selectedAddress)
    message.success(t(['addressBook', 'message', 'contactDeleted']))
  }

  const onCancel = (): void => {
    setShownModal('none')
  }

  return (
    <div className="AddressBook">
      <div className="toolbar">
        <div className="main-title">
          <Trans k={['addressBook', 'book', 'title']} />
        </div>
        <div className="line"></div>
        <div>
          <Button
            data-testid="add-contact-button"
            type="primary"
            className="action"
            onClick={onStartAddNew}
          >
            <Trans k={['addressBook', 'book', 'addNew']} />
          </Button>
        </div>
      </div>
      <div className="address-list">
        {sortedLabels.length === 0 ? (
          <Trans k={['addressBook', 'book', 'noData']} />
        ) : (
          sortedLabels.map((address) => (
            <div key={address} className="row">
              <span className="label">{addressLabels[address]}</span>
              <span className="address">
                {address}{' '}
                <Popover content={t(['addressBook', 'address', 'clickToCopy'])} placement="top">
                  <CopyOutlined className="clickable" onClick={() => copyToClipboard(address)} />
                </Popover>
              </span>
              <span className="actions">
                <span
                  className="delete"
                  {...fillActionHandlers(onStartDelete(address, addressLabels[address]))}
                >
                  <DeleteOutlined />
                </span>
                <span
                  className="edit"
                  {...fillActionHandlers(onStartEdit(address, addressLabels[address]))}
                >
                  <EditOutlined />
                </span>
              </span>
            </div>
          ))
        )}
      </div>

      <EditContactModal
        visible={shownModal === 'Edit'}
        onSave={setAddressLabel}
        onCancel={onCancel}
        setAddress={setAddress}
        setLabel={setLabel}
        address={selectedAddress}
        label={selectedLabel}
        toEdit={toEdit}
      />
      <DeleteContactModal
        visible={shownModal === 'Delete'}
        onDelete={onDelete}
        onCancel={onCancel}
        address={selectedAddress}
        label={selectedLabel}
      />
    </div>
  )
}

export const AddressBook = withStatusGuard(_AddressBook, 'LOADED')
