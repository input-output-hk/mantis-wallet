import {Button, message, Popover} from 'antd'
import React, {useState} from 'react'
import {EmptyProps} from 'antd/lib/empty'
import {Trans} from '../common/Trans'
import {useLocalizedUtilities, useTranslation} from '../settings-state'
import {Dialog} from '../common/Dialog'
import {DialogInput} from '../common/dialog/DialogInput'
import {DialogMessage} from '../common/dialog/DialogMessage'
import {ModalLocker, wrapWithModal} from '../common/MantisModal'
import {toAntValidator, validateAddress} from '../common/util'
import {LoadedState} from '../common/wallet-state'
import {PropsWithWalletState, withStatusGuard} from '../common/wallet-status-guard'
import {NoWallet} from '../wallets/NoWallet'
import './AddressBook.scss'
import {IconButton} from '../common/IconButton'

const LABEL_MAX_LENGTH = 80
const LABEL_FIELD_NAME = 'contact-label'
const ADDRESS_FIELD_NAME = 'contact-address'

type Setter<T> = React.Dispatch<React.SetStateAction<T>>

type ModalId = 'Edit' | 'Delete' | 'none'
type EditMode = 'Add' | 'Edit'

interface EditContactModalProps {
  onSave(address: string, label: string): void
  onCancel(): void
  address: string
  label: string
  setAddress: Setter<string>
  setLabel: Setter<string>
  editMode: EditMode
}

const _EditContactModal = ({
  onSave,
  onCancel,
  address,
  label,
  setAddress,
  setLabel,
  editMode,
}: EditContactModalProps): JSX.Element => {
  const {t} = useTranslation()
  const addressValidator = toAntValidator(t, validateAddress)
  const modalLocker = ModalLocker.useContainer()

  return (
    <Dialog
      title={
        editMode === 'Edit'
          ? t(['addressBook', 'book', 'editContact'])
          : t(['addressBook', 'book', 'newContact'])
      }
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
        [ADDRESS_FIELD_NAME]: address,
        [LABEL_FIELD_NAME]: label,
      }}
    >
      <DialogInput
        label={t(['addressBook', 'label', 'address'])}
        onChange={(e): void => setAddress(e.target.value)}
        formItem={{
          name: ADDRESS_FIELD_NAME,
          rules: [
            {required: true, message: t(['addressBook', 'error', 'addressMustBeSet'])},
            addressValidator,
          ],
        }}
        disabled={editMode === 'Edit'}
        id={ADDRESS_FIELD_NAME}
      />
      <DialogInput
        label={t(['addressBook', 'label', 'label'])}
        onChange={(e): void => setLabel(e.target.value)}
        formItem={{
          name: LABEL_FIELD_NAME,
          rules: [
            {required: true, message: t(['addressBook', 'error', 'labelMustBeSet'])},
            {
              max: LABEL_MAX_LENGTH,
              message: t(['addressBook', 'error', 'labelMaxLength'], {
                replace: {max: LABEL_MAX_LENGTH},
              }),
            },
          ],
        }}
        id={LABEL_FIELD_NAME}
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

export const DeleteContactModal = wrapWithModal(_DeleteContactModal)
export const EditContactModal = wrapWithModal(_EditContactModal)

const _AddressBook = ({
  walletState: {addressBook, editContact, deleteContact},
}: PropsWithWalletState<EmptyProps, LoadedState>): JSX.Element => {
  const {t} = useTranslation()
  const {copyToClipboard} = useLocalizedUtilities()

  const [shownModal, setShownModal] = useState<ModalId>('none')
  const [editMode, setEditMode] = useState<EditMode>('Edit')
  const [selectedAddress, setAddress] = useState('')
  const [selectedLabel, setLabel] = useState('')
  // eslint-disable-next-line fp/no-mutating-methods
  const sortedLabels = [...Object.keys(addressBook)].sort()

  const selectContact = (address: string, label: string): void => {
    setAddress(address)
    setLabel(label)
  }

  const onStartEdit = (address: string) => () => {
    selectContact(address, addressBook[address])
    setEditMode('Edit')
    setShownModal('Edit')
  }

  const onStartAddNew = (): void => {
    selectContact('', '')
    setEditMode('Add')
    setShownModal('Edit')
  }

  const onStartDelete = (address: string) => () => {
    selectContact(address, addressBook[address])
    setShownModal('Delete')
  }

  const onDelete = (): void => {
    deleteContact(selectedAddress)
    message.success(t(['addressBook', 'message', 'contactDeleted']))
  }

  const onCancel = (): void => {
    setShownModal('none')
  }

  return (
    <div className="AddressBook">
      <div className="main-buttons">
        <Button
          data-testid="add-contact-button"
          type="primary"
          className="action right-diagonal"
          onClick={onStartAddNew}
        >
          <Trans k={['addressBook', 'book', 'addNew']} />
        </Button>
      </div>
      <div className="toolbar">
        <div className="main-title">
          <Trans k={['addressBook', 'book', 'title']} />
        </div>
      </div>
      <div className="address-list">
        {sortedLabels.length === 0 ? (
          <Trans k={['addressBook', 'book', 'noData']} />
        ) : (
          sortedLabels.map((address) => {
            const label = addressBook[address]

            return (
              <div key={address} className="row">
                <span className="label">{label}</span>
                <span className="address">
                  {address}{' '}
                  <Popover content={t(['addressBook', 'address', 'clickToCopy'])} placement="top">
                    <IconButton icon="copy" title="Copy" onClick={() => copyToClipboard(address)} />
                  </Popover>
                </span>
                <span className="actions">
                  <span className="delete">
                    <IconButton icon="delete" title="Delete" onClick={onStartDelete(address)} />
                  </span>
                  <span className="edit">
                    <IconButton icon="edit" title="Edit" onClick={onStartEdit(address)} />
                  </span>
                </span>
              </div>
            )
          })
        )}
      </div>

      <EditContactModal
        visible={shownModal === 'Edit'}
        onSave={editContact}
        onCancel={onCancel}
        setAddress={setAddress}
        setLabel={setLabel}
        address={selectedAddress}
        label={selectedLabel}
        editMode={editMode}
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

export const AddressBook = withStatusGuard(_AddressBook, 'LOADED', () => <NoWallet />)
