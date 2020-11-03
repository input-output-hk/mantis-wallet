import '@testing-library/jest-dom/extend-expect'
import React from 'react'
import Web3 from 'web3'
import {render, fireEvent, waitFor, waitForElementToBeRemoved} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {
  expectCalledOnClick,
  findExactlyOneByTag,
  WithSettingsProvider,
} from '../common/test-helpers'
import {WalletState, WalletStatus} from '../common/wallet-state'
import {WalletRestore} from './WalletRestore'

const web3 = new Web3()

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

test('WalletRestore', async () => {
  const walletName = 'Example Wallet Name'
  const password = 'Foobar1234'
  const privateKey = '0x8da4ef21b864d2cc526dbdb2a120bd2874c36c9d0a1fb7f8c63d7f7a8b41de8f'
  const recoveryPhrase = seedPhrase.join(' ')

  const cancel = jest.fn()
  const finish = jest.fn()

  const initialState = {walletStatus: 'NO_WALLET' as WalletStatus, web3}
  const {getByLabelText, getByText, queryByText, getByTestId} = render(
    <WalletState.Provider initialState={initialState}>
      <WalletRestore cancel={cancel} finish={finish} />
    </WalletState.Provider>,
    {wrapper: WithSettingsProvider},
  )

  // Enter wallet name
  expect(queryByText("Name shouldn't be empty")).not.toBeInTheDocument()
  const walletNameInput = getByLabelText('Wallet Name')
  fireEvent.change(walletNameInput, {target: {value: walletName}})

  // Verify password fields
  expect(getByText('Enter Password')).toBeInTheDocument()
  const passwordInput = getByTestId('password')
  const rePasswordInput = getByTestId('rePassword')

  // Enter wallet password
  fireEvent.change(passwordInput, {target: {value: password}})
  fireEvent.change(rePasswordInput, {target: {value: '...'}}) // Type wrong second password
  await waitFor(() => expect(getByText("Passwords don't match")).toBeInTheDocument())
  fireEvent.change(rePasswordInput, {target: {value: password}}) // Type correct password
  await waitForElementToBeRemoved(() => getByText("Passwords don't match"))

  // Enter invalid private key
  const privateKeyInput = getByTestId('private-key')
  fireEvent.change(privateKeyInput, {target: {value: "I'm not a private key"}})

  // Check invalid private key message
  await waitFor(() => expect(getByText('Invalid private key')).toBeInTheDocument())

  // Enter valid private key
  fireEvent.change(privateKeyInput, {target: {value: privateKey}})

  // Error disappears
  await waitForElementToBeRemoved(() => getByText('Invalid private key'))

  // Switch to recovery phrase restore
  const recoverySwitch = getByText('Recovery Phrase')
  userEvent.click(recoverySwitch)

  // Enter recovery phrase
  const recoveryPhraseInput = findExactlyOneByTag(getByTestId('seed-phrase'), 'input')
  fireEvent.change(recoveryPhraseInput, {target: {value: recoveryPhrase}})

  // Click Cancel
  await expectCalledOnClick(() => getByText('Cancel'), cancel)
})
