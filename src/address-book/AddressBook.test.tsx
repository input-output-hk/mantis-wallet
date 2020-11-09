import '@testing-library/jest-dom/extend-expect'
import React from 'react'
import Web3 from 'web3'
import {fireEvent, render, waitFor} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {AddressBook} from './AddressBook'
import {WalletState, WalletStatus} from '../common/wallet-state'
import {SettingsState} from '../settings-state'
import {BackendState} from '../common/backend-state'
import {expectNoValidationErrorOnSubmit} from '../common/test-helpers'

const web3 = new Web3()

it('adds a new contact', async () => {
  const initialState = {walletStatus: 'LOADED' as WalletStatus, web3}
  const {queryByText, getByLabelText, getByTestId} = render(
    <SettingsState.Provider>
      <WalletState.Provider initialState={initialState}>
        <BackendState.Provider initialState={{web3}}>
          <AddressBook />
        </BackendState.Provider>
      </WalletState.Provider>
    </SettingsState.Provider>,
  )

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

  const FINAL_ADDRESS = '0xffffffffffffffffffffffffffffffffffffffff'
  fireEvent.change(addressInput, {target: {value: FINAL_ADDRESS}})
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
    expect(queryByText(FINAL_ADDRESS)).toBeInTheDocument()
    expect(queryByText(FINAL_LABEL)).toBeInTheDocument()
  })
})
