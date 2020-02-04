import '@testing-library/jest-dom/extend-expect'
import React from 'react'
import {render, fireEvent} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {WalletRestore} from './WalletRestore'

jest.mock('../config/renderer.ts')

const seedPhrase = [
  'vengeful',
  'legs',
  'cute',
  'rifle',
  'bite',
  'spell',
  'ambiguous',
  'impossible',
  'fabulous',
  'observe',
  'offer',
  'baseball',
]

test('WalletRestore', () => {
  const walletName = 'Example Wallet Name'
  const password = 'Foobar1234'
  const privateKey = 'm-test-shl-sk1fj335eanpmupaj9vx5879t7ljfnh7xct486rqgwxw8evwp2qkaksmcqu88'
  const recoveryPhrase = seedPhrase.join(' ')

  const cancel = jest.fn()
  const finish = jest.fn()

  const {getByLabelText, getByText, getByRole, getByTestId} = render(
    <WalletRestore cancel={cancel} finish={finish} />,
  )

  // Enter wallet name
  expect(getByText("Name shouldn't be empty")).toBeInTheDocument()
  const walletNameInput = getByLabelText('Wallet name')
  expect(walletNameInput).toBeInTheDocument()
  fireEvent.change(walletNameInput, {target: {value: walletName}})

  // Enter private key
  const privateKeyInput = getByTestId('private-key')
  expect(privateKeyInput).toBeInTheDocument()
  fireEvent.change(privateKeyInput, {target: {value: privateKey}})

  // Switch to recovery phrase restore
  const recoverySwitch = getByText('Recovery Phrase')
  expect(recoverySwitch).toBeInTheDocument()
  userEvent.click(recoverySwitch)

  // Enter recovery phrase
  const recoveryPhraseInput = document.getElementsByClassName('ant-select-search__field')[0]
  expect(recoveryPhraseInput).toBeInTheDocument()
  fireEvent.change(recoveryPhraseInput, {target: {value: recoveryPhrase}})

  // Enable password
  expect(getByText('Spending password')).toBeInTheDocument()
  const spendingPasswordSwitch = getByRole('switch')
  expect(spendingPasswordSwitch).toBeInTheDocument()
  userEvent.click(spendingPasswordSwitch)

  // Verify password fields
  expect(getByText('Enter Password')).toBeInTheDocument()
  const passwordInput = getByTestId('password')
  expect(passwordInput).toBeInTheDocument()
  const rePasswordInput = getByTestId('rePassword')
  expect(rePasswordInput).toBeInTheDocument()

  // Enter spending password
  fireEvent.change(passwordInput, {target: {value: password}})
  fireEvent.change(rePasswordInput, {target: {value: '...'}}) // Type wrong second password
  expect(getByText("Passwords don't match")).toBeInTheDocument()
  fireEvent.change(rePasswordInput, {target: {value: password}}) // Type correct password

  // Click Cancel
  const cancelButton = getByText('Cancel')
  expect(cancelButton).toBeInTheDocument()
  userEvent.click(cancelButton)
  expect(cancel).toHaveBeenCalled()
})
