import '@testing-library/jest-dom/extend-expect'
import React from 'react'
import {render, waitFor, waitForElementToBeRemoved} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {
  expectCalledOnClick,
  WithSettingsProvider,
  DIALOG_VALIDATION_ERROR,
} from '../common/test-helpers'
import {WalletCreateDefineStep} from './create/WalletCreateDefineStep'
import {WalletCreateSecurityStep} from './create/WalletCreateSecurityStep'
import {WalletCreateDisplayRecoveryStep} from './create/WalletCreateDisplayRecoveryStep'
import {WalletCreateVerifyRecoveryStep} from './create/WalletCreateVerifyRecoveryStep'

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

test('WalletCreate `Define` step', async () => {
  const walletName = 'Example Wallet Name'
  const password = 'Foobar1234'
  const cancel = jest.fn()
  const next = jest.fn()

  const {getByLabelText, getByText, queryByText, getByTestId} = render(
    <WalletCreateDefineStep cancel={cancel} next={next} />,
    {wrapper: WithSettingsProvider},
  )

  // Enter wallet name
  expect(queryByText("Name shouldn't be empty")).not.toBeInTheDocument()
  const walletNameInput = getByLabelText('Wallet name')
  userEvent.type(walletNameInput, walletName)

  // Verify password fields
  expect(getByText('Enter Password')).toBeInTheDocument()
  const passwordInput = getByTestId('password')
  const rePasswordInput = getByTestId('rePassword')

  // Enter wallet password
  userEvent.type(passwordInput, password)
  userEvent.type(rePasswordInput, password.slice(0, 1)) // Type first character
  await waitFor(() => expect(getByText("Passwords don't match")).toBeInTheDocument())
  userEvent.type(rePasswordInput, password.slice(1)) // Type rest of the password
  await waitForElementToBeRemoved(() => getByText("Passwords don't match"))

  // Click Next
  const nextButton = getByTestId('right-button')
  expect(nextButton).toBeEnabled()
  userEvent.click(nextButton)
  await waitFor(() => expect(next).toBeCalledWith(walletName, password))

  // Click Cancel
  expectCalledOnClick(() => getByText('Cancel'), cancel)
})

test('WalletCreate `Security` step', async () => {
  const spendingKey = 'm-test-shl-sk122732c6py9h89unt0069ce4epl8e707sv04jr3aqzts94styr9wq4lkg85'
  const cancel = jest.fn()
  const next = jest.fn()

  const {getByText, getByRole, getByLabelText} = render(
    <WalletCreateSecurityStep cancel={cancel} next={next} spendingKey={spendingKey} />,
    {wrapper: WithSettingsProvider},
  )

  // Show spending key
  const spendingKeySwitch = getByRole('switch')
  userEvent.click(spendingKeySwitch)
  expect(getByText(spendingKey)).toBeInTheDocument()
  expect(getByText('Download txt')).toBeInTheDocument()

  // Click checkbox
  userEvent.click(
    getByLabelText(
      'I understand that I need to save my private key to enable mining in the future.',
    ),
  )

  // Click Cancel
  await expectCalledOnClick(() => getByText('Cancel'), cancel)

  // Click Next
  await expectCalledOnClick(() => getByText('Next'), next)
})

test('WalletCreate `Display Recovery` step', async () => {
  const back = jest.fn()
  const next = jest.fn()

  const {getByText, getByLabelText} = render(
    <WalletCreateDisplayRecoveryStep back={back} next={next} seedPhrase={seedPhrase} />,
    {wrapper: WithSettingsProvider},
  )

  // every seed word is present in the docuement
  seedPhrase.map((word: string) => expect(getByText(word)).toBeInTheDocument())

  // Click Back
  await expectCalledOnClick(() => getByText('Back'), back)

  // Click Next
  const nextButton = getByText('Next')
  // Next button should be enabled
  expect(nextButton).toBeEnabled()
  // Clicking it should stop with an error
  userEvent.click(nextButton)
  await waitFor(() => expect(getByText(DIALOG_VALIDATION_ERROR)).toBeInTheDocument())

  // Confirm
  const writtenDownCheckbox = getByLabelText('Yes, I have written it down.')
  userEvent.click(writtenDownCheckbox)

  // Button should be enabled afteer confirmation
  userEvent.click(nextButton)
  await waitFor(() => expect(next).toBeCalled())
})

test('WalletCreate `Verify Recovery` step', async () => {
  const back = jest.fn()
  const finish = jest.fn()

  const {getByText, getByLabelText} = render(
    <WalletCreateVerifyRecoveryStep
      back={back}
      finish={finish}
      seedPhrase={seedPhrase}
      shuffledSeedPhrase={seedPhrase}
    />,
    {wrapper: WithSettingsProvider},
  )

  // Click seed words in correct order
  seedPhrase
    .map((word: string) => getByText(word))
    .map((elem) => {
      expect(elem).toBeInTheDocument()
      userEvent.click(elem)
    })

  // Click Finish (disabled)
  const finishButton = getByText('Finish')
  userEvent.click(finishButton)
  // Button is still disabled
  expect(finish).not.toBeCalled()

  // Click Back
  await expectCalledOnClick(() => getByText('Back'), back)

  // Accept conditions
  const checkbox1 = getByLabelText(
    'I understand that my wallet and tokens are held securely on this device only and not on any servers',
  )
  const checkbox2 = getByLabelText(
    'I understand that if this application is moved to another device or is deleted, my wallet can only be recovered with the backup phrase I have written down and stored securely',
  )
  userEvent.click(checkbox1)
  userEvent.click(checkbox2)

  // Click Finish
  userEvent.click(finishButton)
  await waitFor(() => expect(finish).toBeCalled())
})
