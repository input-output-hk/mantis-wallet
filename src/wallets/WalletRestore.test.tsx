import '@testing-library/jest-dom/extend-expect'
import React from 'react'
import {render} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {WalletRestore} from './WalletRestore'

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
  userEvent.type(walletNameInput, walletName)

  // Enter private key
  const privateKeyInput = getByTestId('private-key')
  expect(privateKeyInput).toBeInTheDocument()
  userEvent.type(privateKeyInput, privateKey)

  // Switch to recovery phrase restore
  const recoverySwitch = getByText('Recovery Phrase')
  expect(recoverySwitch).toBeInTheDocument()
  userEvent.click(recoverySwitch)

  // Enter recovery phrase
  const recoverPhraseInput = getByTestId('recovery-phrase')
  expect(recoverPhraseInput).toBeInTheDocument()
  userEvent.type(recoverPhraseInput, recoveryPhrase)

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
  userEvent.type(passwordInput, password)
  userEvent.type(rePasswordInput, password.slice(0, 1)) // Type first character
  expect(getByText("Passwords don't match")).toBeInTheDocument()
  userEvent.type(rePasswordInput, password) // Type full password

  // Click Cancel
  const cancelButton = getByText('Cancel')
  expect(cancelButton).toBeInTheDocument()
  userEvent.click(cancelButton)
  expect(cancel).toHaveBeenCalled()
})
