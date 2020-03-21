import '@testing-library/jest-dom/extend-expect'
import React from 'react'
import {render} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
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

test('WalletCreate `Define` step', () => {
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
  expect(walletNameInput).toBeInTheDocument()
  userEvent.type(walletNameInput, walletName)

  // Click spending password switch
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

  // Click Next
  const nextButton = getByText('Next →')
  expect(nextButton).toBeInTheDocument()
  userEvent.click(nextButton)
  expect(next).toHaveBeenCalledWith(walletName, password)

  // Click Cancel
  const cancelButton = getByText('Cancel')
  expect(cancelButton).toBeInTheDocument()
  userEvent.click(cancelButton)
  expect(cancel).toHaveBeenCalled()
})

test('WalletCreate `Security` step', () => {
  const spendingKey = 'm-test-shl-sk122732c6py9h89unt0069ce4epl8e707sv04jr3aqzts94styr9wq4lkg85'
  const cancel = jest.fn()
  const next = jest.fn()

  const {getByText, getByRole} = render(
    <WalletCreateSecurityStep cancel={cancel} next={next} spendingKey={spendingKey} />,
  )

  // Show spending key
  const spendingKeySwitch = getByRole('switch')
  expect(spendingKeySwitch).toBeInTheDocument()
  userEvent.click(spendingKeySwitch)
  expect(getByText(spendingKey)).toBeInTheDocument()
  expect(getByText('Download.txt')).toBeInTheDocument()

  // Click Cancel
  const cancelButton = getByText('Cancel')
  expect(cancelButton).toBeInTheDocument()
  userEvent.click(cancelButton)
  expect(cancel).toHaveBeenCalled()

  // Click Next
  const nextButton = getByText('Next →')
  expect(nextButton).toBeInTheDocument()
  userEvent.click(nextButton)
  expect(next).toHaveBeenCalled()
})

test('WalletCreate `Display Recovery` step', () => {
  const back = jest.fn()
  const next = jest.fn()

  const {getByText} = render(
    <WalletCreateDisplayRecoveryStep back={back} next={next} seedPhrase={seedPhrase} />,
  )

  // every seed word is present in the docuement
  seedPhrase.map((word: string) => expect(getByText(word)).toBeInTheDocument())

  // Click Back
  const backButton = getByText('Back')
  expect(backButton).toBeInTheDocument()
  userEvent.click(backButton)
  expect(back).toHaveBeenCalled()

  // Click Next
  const nextButton = getByText('Next →')
  expect(nextButton).toBeInTheDocument()
  userEvent.click(nextButton)
  // Next button should be disabled
  expect(next).not.toHaveBeenCalled()

  // Confirm
  const approveText = getByText('Yes, I have written it down.')
  expect(approveText).toBeInTheDocument()
  userEvent.click(approveText)

  // Button should be enabled afteer confirmation
  userEvent.click(nextButton)
  expect(next).toHaveBeenCalled()
})

test('WalletCreate `Verify Recovery` step', () => {
  const back = jest.fn()
  const finish = jest.fn()

  const {getByText} = render(
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
  expect(finishButton).toBeInTheDocument()
  userEvent.click(finishButton)
  // Button is still disabled
  expect(finish).not.toHaveBeenCalled()

  // Click Back
  const backButton = getByText('Back')
  expect(backButton).toBeInTheDocument()
  userEvent.click(backButton)
  expect(back).toHaveBeenCalled()

  // Accept conditions
  const label1 = getByText(
    'I understand that my wallet and tokens are held securely on this device only and not on any servers',
  )
  const label2 = getByText(
    'I understand that if this application is moved to another device or is deleted, my wallet can only be recovered with the backup phrase I have written down and stored securely',
  )
  expect(label1).toBeInTheDocument()
  expect(label2).toBeInTheDocument()
  userEvent.click(label1)
  userEvent.click(label2)

  // Click Finish
  userEvent.click(finishButton)
  expect(finish).toHaveBeenCalled()
})
