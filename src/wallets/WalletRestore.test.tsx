import '@testing-library/jest-dom/extend-expect'
import React from 'react'
import {render, fireEvent, waitFor, waitForElementToBeRemoved} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {expectCalledOnClick, findExactlyOneByTag} from '../common/test-helpers'
import {WalletState, WalletStatus} from '../common/wallet-state'
import {BuildJobState} from '../common/build-job-state'
import {makeWeb3Worker} from '../web3'
import {WalletRestore} from './WalletRestore'
import {mockWeb3Worker} from '../web3-mock'

const web3 = makeWeb3Worker(mockWeb3Worker)

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

test('WalletRestore', async () => {
  const walletName = 'Example Wallet Name'
  const password = 'Foobar1234'
  const privateKey = 'm-test-shl-sk1fj335eanpmupaj9vx5879t7ljfnh7xct486rqgwxw8evwp2qkaksmcqu88'
  const recoveryPhrase = seedPhrase.join(' ')

  const cancel = jest.fn()
  const finish = jest.fn()

  const initialState = {walletStatus: 'NO_WALLET' as WalletStatus, web3}
  const {getByLabelText, getByText, queryByText, getByTestId} = render(
    <BuildJobState.Provider initialState={{web3}}>
      <WalletState.Provider initialState={initialState}>
        <WalletRestore cancel={cancel} finish={finish} />
      </WalletState.Provider>
    </BuildJobState.Provider>,
  )

  // Enter wallet name
  expect(queryByText("Name shouldn't be empty")).not.toBeInTheDocument()
  const walletNameInput = getByLabelText('Wallet name')
  fireEvent.change(walletNameInput, {target: {value: walletName}})

  // Enter private key
  const privateKeyInput = getByTestId('private-key')
  fireEvent.change(privateKeyInput, {target: {value: privateKey}})

  // Switch to recovery phrase restore
  const recoverySwitch = getByText('Recovery Phrase')
  userEvent.click(recoverySwitch)

  // Enter recovery phrase
  const recoveryPhraseInput = findExactlyOneByTag(getByTestId('seed-phrase'), 'input')
  fireEvent.change(recoveryPhraseInput, {target: {value: recoveryPhrase}})

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

  // Click Cancel
  await expectCalledOnClick(() => getByText('Cancel'), cancel)
})
