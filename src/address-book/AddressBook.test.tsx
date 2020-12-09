import '@testing-library/jest-dom/extend-expect'
import React from 'react'
import {fireEvent, render, waitFor} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {AddressBook} from './AddressBook'
import {expectNoValidationErrorOnSubmit, createWithProviders} from '../common/test-helpers'

const VALID_ADDRESS_01 = '0x0000000000000000000000000000000000000000'
const VALID_ADDRESS_02 = '0xffffffffffffffffffffffffffffffffffffffff'

it('can add a new contact', async () => {
  const {queryByText, getByLabelText, getByTestId} = render(<AddressBook />, {
    wrapper: createWithProviders(),
  })

  const modalTitle = 'New Contact'

  const newContactButton = getByTestId('add-contact-button')
  userEvent.click(newContactButton)

  // modal opened
  await waitFor(() => expect(queryByText(modalTitle)).toBeInTheDocument())

  const saveButton = getByTestId('right-button')
  expect(saveButton).toBeDisabled()

  const cancelButton = getByTestId('left-button')
  expect(cancelButton).toBeEnabled()

  // address validation works
  const addressInput = getByLabelText('Address')
  const INVALID_ADDRESS_MSG = 'Invalid address'

  fireEvent.change(addressInput, {target: {value: 'not an address'}})
  await waitFor(() => expect(queryByText(INVALID_ADDRESS_MSG)).toBeInTheDocument())

  fireEvent.change(addressInput, {target: {value: VALID_ADDRESS_01}})
  await waitFor(() => expect(queryByText(INVALID_ADDRESS_MSG)).not.toBeInTheDocument())

  expect(saveButton).toBeDisabled()

  // label validation works
  const labelInput = getByLabelText('Label')
  const LIMIT = 80
  const INVALID_LABEL_MSG = `Label length must not exceed ${LIMIT} characters`

  fireEvent.change(labelInput, {target: {value: 'X'.repeat(LIMIT + 1)}})
  await waitFor(() => expect(queryByText(INVALID_LABEL_MSG)).toBeInTheDocument())

  const FINAL_LABEL = 'X'.repeat(LIMIT)
  fireEvent.change(labelInput, {target: {value: FINAL_LABEL}})
  await waitFor(() => expect(queryByText(INVALID_LABEL_MSG)).not.toBeInTheDocument())

  // saving the contact
  await expectNoValidationErrorOnSubmit(queryByText, saveButton)

  // modal closed
  await waitFor(() => expect(queryByText(modalTitle)).not.toBeInTheDocument())

  // new contact shows up
  await waitFor(() => {
    expect(queryByText(VALID_ADDRESS_01)).toBeInTheDocument()
    expect(queryByText(FINAL_LABEL)).toBeInTheDocument()
  })
})

it('can edit a contact', async () => {
  const {queryByText, getByLabelText, getByTestId, getByTitle} = render(<AddressBook />, {
    wrapper: createWithProviders({
      wallet: {addressBook: {[VALID_ADDRESS_01]: 'Gandhi'}, accounts: [], tncAccepted: true},
    }),
  })

  const modalTitle = 'Edit Contact'

  const startEditButton = getByTitle(modalTitle)
  userEvent.click(startEditButton)

  // modal opened
  await waitFor(() => expect(queryByText(modalTitle)).toBeInTheDocument())

  const saveButton = getByTestId('right-button')
  expect(saveButton).toBeEnabled()

  const cancelButton = getByTestId('left-button')
  expect(cancelButton).toBeEnabled()

  // address cannot be changed in edit mode
  const addressInput = getByLabelText('Address')
  expect(addressInput).toBeDisabled()

  // address input shows up with the correct value
  expect(addressInput).toHaveValue(VALID_ADDRESS_01)

  // label is editable
  const labelInput = getByLabelText('Label')
  expect(labelInput).toBeEnabled()

  // label input shows up with the correct value
  expect(labelInput).toHaveValue('Gandhi')

  // change label
  fireEvent.change(labelInput, {target: {value: 'Ihdnag'}})

  // saving the contact
  await expectNoValidationErrorOnSubmit(queryByText, saveButton)

  // modal closed
  await waitFor(() => expect(queryByText(modalTitle)).not.toBeInTheDocument())

  // new contact shows up
  await waitFor(() => {
    // address is the same
    expect(queryByText(VALID_ADDRESS_01)).toBeInTheDocument()
    // previous label doesn't show up
    expect(queryByText('Gandhi')).not.toBeInTheDocument()
    // new label shows up
    expect(queryByText('Ihdnag')).toBeInTheDocument()
  })
})

it('can delete a contact', async () => {
  const {queryByText, getByTestId, getAllByTitle} = render(<AddressBook />, {
    wrapper: createWithProviders({
      wallet: {
        addressBook: {[VALID_ADDRESS_01]: 'Gandhi', [VALID_ADDRESS_02]: 'Martin'},
        accounts: [],
        tncAccepted: true,
      },
    }),
  })

  const modalTitle = 'Delete Contact'

  const expectModalOpenedWithCorrectData = (label: string, address: string) => (): void => {
    expect(queryByText(modalTitle)).toBeInTheDocument()
    expect(queryByText('Are you sure you want to delete this contact?')).toBeInTheDocument()
    expect(queryByText(`${label} (${address})`)).toBeInTheDocument()
  }

  const expectModalClosed = (): void => expect(queryByText(modalTitle)).not.toBeInTheDocument()

  const startDeleteButtons = getAllByTitle('Delete Contact')
  const startDeleteButtonGandhi = startDeleteButtons[0]
  const startDeleteButtonMartin = startDeleteButtons[1]

  // ETCM-376: open modal for Gandhi
  userEvent.click(startDeleteButtonGandhi)
  await waitFor(expectModalOpenedWithCorrectData('Gandhi', VALID_ADDRESS_01))

  // cancel deleting Gandhi
  const cancelButton = getByTestId('left-button')
  expect(cancelButton).toBeEnabled()
  userEvent.click(cancelButton)
  await waitFor(expectModalClosed)

  // check if Martin exists in the address book
  expect(queryByText('Martin')).toBeInTheDocument()
  expect(queryByText(VALID_ADDRESS_02)).toBeInTheDocument()

  // open delete modal for Martin
  userEvent.click(startDeleteButtonMartin)
  await waitFor(expectModalOpenedWithCorrectData('Martin', VALID_ADDRESS_02))

  // delete Martin
  const deleteButton = getByTestId('right-button')
  expect(deleteButton).toBeEnabled()
  userEvent.click(deleteButton)
  await waitFor(expectModalClosed)

  // data for Martin is deleted, data for Gandhi is still there
  await waitFor(() => {
    expect(queryByText('Gandhi')).toBeInTheDocument()
    expect(queryByText(VALID_ADDRESS_01)).toBeInTheDocument()
    expect(queryByText('Martin')).not.toBeInTheDocument()
    expect(queryByText(VALID_ADDRESS_02)).not.toBeInTheDocument()
  })
})
