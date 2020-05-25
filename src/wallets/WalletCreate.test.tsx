import '@testing-library/jest-dom/extend-expect'
import React from 'react'
import {render, waitFor} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {expectCalledOnClick} from '../common/test-helpers'
import {WalletCreateDefineStep} from './create/WalletCreateDefineStep'
import {WalletCreateSecurityStep} from './create/WalletCreateSecurityStep'
import {WalletCreateDisplayRecoveryStep} from './create/WalletCreateDisplayRecoveryStep'
import {WalletCreateVerifyRecoveryStep} from './create/WalletCreateVerifyRecoveryStep'

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

test('WalletCreate `Define` step', async () => {
  const walletName = 'Example Wallet Name'
  const password = 'Foobar1234'
  const cancel = jest.fn()
  const next = jest.fn()

  const {getByLabelText, getByText, getByRole, getByTestId} = render(
    <WalletCreateDefineStep cancel={cancel} next={next} />,
  )

  // Enter wallet name
  expect(getByText("Name shouldn't be empty")).toBeInTheDocument()
  const walletNameInput = getByLabelText('Wallet name')
  userEvent.type(walletNameInput, walletName)

  // Click wallet password switch
  expect(getByText('Wallet password')).toBeInTheDocument()
  const spendingPasswordSwitch = getByRole('switch')
  userEvent.click(spendingPasswordSwitch)

  // Verify password fields
  expect(getByText('Enter Password')).toBeInTheDocument()
  const passwordInput = getByTestId('password')
  const rePasswordInput = getByTestId('rePassword')

  // Enter wallet password
  userEvent.type(passwordInput, password)
  userEvent.type(rePasswordInput, password.slice(0, 1)) // Type first character
  expect(getByText("Passwords don't match")).toBeInTheDocument()
  userEvent.type(rePasswordInput, password.slice(1)) // Type rest of the password

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

  const {getByText, getByRole} = render(
    <WalletCreateSecurityStep cancel={cancel} next={next} spendingKey={spendingKey} />,
  )

  // Show spending key
  const spendingKeySwitch = getByRole('switch')
  userEvent.click(spendingKeySwitch)
  expect(getByText(spendingKey)).toBeInTheDocument()
  expect(getByText('Download.txt')).toBeInTheDocument()

  // Click Cancel
  await expectCalledOnClick(() => getByText('Cancel'), cancel)

  // Click Next
  await expectCalledOnClick(() => getByText('Next →'), next)
})

test('WalletCreate `Display Recovery` step', async () => {
  const back = jest.fn()
  const next = jest.fn()

  const {getByText, getByLabelText} = render(
    <WalletCreateDisplayRecoveryStep back={back} next={next} seedPhrase={seedPhrase} />,
  )

  // every seed word is present in the docuement
  seedPhrase.map((word: string) => expect(getByText(word)).toBeInTheDocument())

  // Click Back
  await expectCalledOnClick(() => getByText('Back'), back)

  // Click Next
  const nextButton = getByText('Next →')
  userEvent.click(nextButton)
  // Next button should be disabled
  expect(nextButton).toBeDisabled()
  expect(next).not.toBeCalled()

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
