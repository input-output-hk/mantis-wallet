import '@testing-library/jest-dom/extend-expect'
import React from 'react'
import {fireEvent, render, waitFor} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {AddressBook} from './AddressBook'
import {expectNoValidationErrorOnSubmit, createWithProviders} from '../common/test-helpers'

const VALID_ADDRESS = '0xffffffffffffffffffffffffffffffffffffffff'

it('can add a new contact', async () => {
  const {queryByText, getByLabelText, getByTestId} = render(<AddressBook />, {
    wrapper: createWithProviders(),
  })

  const newContactButton = getByTestId('add-contact-button')
  userEvent.click(newContactButton)

  // dialog opened
  await waitFor(() => expect(queryByText('Edit Contact')).toBeInTheDocument())

  const saveButton = getByTestId('right-button')
  expect(saveButton).toBeDisabled()

  const cancelButton = getByTestId('left-button')
  expect(cancelButton).toBeEnabled()

  // address validation works
  const addressInput = getByLabelText('Address')
  const INVALID_ADDRESS_MSG = 'Invalid address'

  fireEvent.change(addressInput, {target: {value: 'not an address'}})
  await waitFor(() => expect(queryByText(INVALID_ADDRESS_MSG)).toBeInTheDocument())

  fireEvent.change(addressInput, {target: {value: VALID_ADDRESS}})
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

  // dialog closed
  await waitFor(() => expect(queryByText('Edit Contact')).not.toBeInTheDocument())

  // new contact shows up
  await waitFor(() => {
    expect(queryByText(VALID_ADDRESS)).toBeInTheDocument()
    expect(queryByText(FINAL_LABEL)).toBeInTheDocument()
  })
})

it('can edit a contact', async () => {
  const {queryByText, getByLabelText, getByTestId, getByTitle} = render(<AddressBook />, {
    wrapper: createWithProviders({
      wallet: {addressBook: {[VALID_ADDRESS]: 'Gandhi'}, accounts: []},
    }),
  })

  const startEditButton = getByTitle('Edit Contact')
  userEvent.click(startEditButton)

  // dialog opened
  await waitFor(() => expect(queryByText('Edit Contact')).toBeInTheDocument())

  const saveButton = getByTestId('right-button')
  expect(saveButton).toBeEnabled()

  const cancelButton = getByTestId('left-button')
  expect(cancelButton).toBeEnabled()

  // address cannot be changed in edit mode
  const addressInput = getByLabelText('Address')
  expect(addressInput).toBeDisabled()

  // address input shows up with the correct value
  expect(addressInput).toHaveValue(VALID_ADDRESS)

  // label is editable
  const labelInput = getByLabelText('Label')
  expect(labelInput).toBeEnabled()

  // label input shows up with the correct value
  expect(labelInput).toHaveValue('Gandhi')

  // change label
  fireEvent.change(labelInput, {target: {value: 'Ihdnag'}})

  // saving the contact
  await expectNoValidationErrorOnSubmit(queryByText, saveButton)

  // dialog closed
  await waitFor(() => expect(queryByText('Edit Contact')).not.toBeInTheDocument())

  // new contact shows up
  await waitFor(() => {
    // address is the same
    expect(queryByText(VALID_ADDRESS)).toBeInTheDocument()
    // previous label doesn't show up
    expect(queryByText('Gandhi')).not.toBeInTheDocument()
    // new label shows up
    expect(queryByText('Ihdnag')).toBeInTheDocument()
  })
})
