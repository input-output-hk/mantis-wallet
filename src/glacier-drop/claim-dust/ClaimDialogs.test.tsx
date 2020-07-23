import '@testing-library/jest-dom/extend-expect'
import React from 'react'
import {fireEvent, waitFor} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import BigNumber from 'bignumber.js'
import {toWei} from 'web3/lib/utils/utils.js'
import ethereumLogo from '../../assets/icons/chains/ethereum.svg'
import ethereumClippedLogo from '../../assets/icons/chains/ethereum-clipped.svg'
import ethereumBurnLogo from '../../assets/icons/chains/m-eth.svg'
import {
  EMPTY_ADDRESS_MSG,
  INVALID_ADDRESS_MSG,
  PRIVATE_KEY_MUST_BE_SET_MSG,
  PRIVATE_KEY_INVALID_MSG,
} from '../../common/util'
import {expectCalledOnClick, glacierWrappedRender} from '../../common/test-helpers'
import {UNLOCK_BUTTON_TEXT} from './claim-with-strings'
import {DisplayChain} from '../../pob/chains'
import {ClaimWithKey} from './ClaimWithKey'
import {
  ClaimWithMessage,
  MESSAGE_MUST_BE_SET_TEXT,
  INVALID_SIGNED_MESSAGE_TEXT,
} from './ClaimWithMessage'
import {SelectMethod} from './SelectMethod'
import {Exchange} from './Exchange'
import {EnterAddress} from './EnterAddress'
import {VerifyAddress} from './VerifyAddress'
import {GeneratedMessage} from './GeneratedMessage'
import {DIALOG_VALIDATION_ERROR} from '../../common/Dialog'
import {ClaimController, ModalId} from './ClaimController'
import {WalletState, LoadedState} from '../../common/wallet-state'

jest.mock('../../config/renderer.ts')

const EXTERNAL_AMOUNT = new BigNumber(123456789123456789124)
const EXTERNAL_AS_SRT = '123.4568'
const DUST_AMOUNT = new BigNumber(987654321)
const DUST_AS_STR = '9.876543'
const TRANSPARENT_ADDRESS_1 = 'm-main-uns-ad1rjfgdj6fewrhlv6j5qxeck38ms2t5sshgg5upk'
const TRANSPARENT_ADDRESS_2 = 'm-test-uns-ad17upzkhnpmuenuhk3lnrc64q5kr0l3ez44g8u7r'
const ETC_ADDRESS = '0x3a649Fe33e0845Df3e26977cc7B4592aFEC732Ba'
const ETC_PRIVATE_KEY = '0x9c33b6ccd581b0635f154b5df78276587655f1f4fad46eb034c751511fe86474'

const fooChain: DisplayChain = {
  symbol: 'DOGE',
  name: 'Dogecoin',
  logo: ethereumLogo,
  clippedLogo: ethereumClippedLogo,
  burnLogo: ethereumBurnLogo,
  unitType: 'Ether',
}

test('Enter External Address', async () => {
  const onNext = jest.fn()
  const onCancel = jest.fn()

  const {getByLabelText, getByText, queryByText} = glacierWrappedRender(
    <EnterAddress visible onNext={onNext} onCancel={onCancel} chain={fooChain} />,
  )

  // Find Public Address field
  const publicAddressInput = getByLabelText(`${fooChain.symbol} Public Address`)

  // Find Proceed Button
  const submitButton = getByText('Proceed')

  // Submit button can be clicked but it shows a dialog validation error
  expect(submitButton).toBeEnabled()
  userEvent.click(submitButton)
  await waitFor(() => expect(getByText(DIALOG_VALIDATION_ERROR)).toBeInTheDocument())

  // At this point we expect an empty address error msg
  await waitFor(() => expect(getByText(EMPTY_ADDRESS_MSG)).toBeInTheDocument())

  // We expect invalid address msgs in these cases
  fireEvent.change(publicAddressInput, {target: {value: 'invalid address'}})
  await waitFor(() => expect(getByText(INVALID_ADDRESS_MSG)).toBeInTheDocument())

  // Almost valid public address (checksum fails)
  fireEvent.change(publicAddressInput, {
    target: {value: '0x3a649Fe33e0845Df3e26977cc7B4592aFEC732Bb'},
  })
  await waitFor(() => expect(getByText(INVALID_ADDRESS_MSG)).toBeInTheDocument())

  // Cancel works any time
  await expectCalledOnClick(() => getByText('Cancel'), onCancel)

  // Finally, we expect no errors when we enter a valid address
  fireEvent.change(publicAddressInput, {
    target: {value: '0x3a649Fe33e0845Df3e26977cc7B4592aFEC732Ba'},
  })
  await waitFor(() => expect(queryByText(INVALID_ADDRESS_MSG)).not.toBeInTheDocument())

  // Now submit is enabled
  expect(submitButton).toBeEnabled()
})

test('Exchange', async () => {
  const onNext = jest.fn()
  const onCancel = jest.fn()

  const transparentAddresses = [TRANSPARENT_ADDRESS_1, TRANSPARENT_ADDRESS_2]

  const {getByLabelText, getByText, queryByText, getAllByText} = glacierWrappedRender(
    <Exchange
      visible
      minimumThreshold={new BigNumber(toWei(1))}
      externalAmount={EXTERNAL_AMOUNT}
      minimumDustAmount={DUST_AMOUNT}
      availableDust={new BigNumber(1000000)}
      transparentAddresses={transparentAddresses}
      onNext={onNext}
      onCancel={onCancel}
      chain={fooChain}
    />,
  )

  // Find Submit Button
  const submitButton = getByText('Go to Unlocking')

  // Submit button can be clicked but it shows a dialog validation error
  expect(submitButton).toBeEnabled()
  userEvent.click(submitButton)
  await waitFor(() => expect(getByText(DIALOG_VALIDATION_ERROR)).toBeInTheDocument())

  // External Balance shown
  expect(getByText(`${fooChain.symbol} Balance`)).toBeInTheDocument()
  expect(getByText(EXTERNAL_AS_SRT)).toBeInTheDocument()

  // Dust Balance shown
  expect(getByText('You are eligible for at least')).toBeInTheDocument()
  expect(getByText(DUST_AS_STR)).toBeInTheDocument()

  // Submit is disabled without confirmation
  const confirmCheckbox = getByLabelText(`Confirm ${fooChain.symbol} Balance OK`)
  userEvent.click(confirmCheckbox)

  // First transparent address is selected by default
  expect(getByText(transparentAddresses[0])).toBeInTheDocument()
  expect(queryByText(transparentAddresses[1])).not.toBeInTheDocument()

  // Toggle address dropdown
  const dropdownTrigger = getByText('Midnight Transparent Address ▼')
  fireEvent.mouseEnter(dropdownTrigger)

  // Midnight transparent addresses are shown in the dropdown
  const otherAddress = transparentAddresses[1]
  await waitFor(() => expect(queryByText(otherAddress)).toBeInTheDocument())

  // Document contains first address twice: selected field and dropdown
  const selectedAddress = getAllByText(transparentAddresses[0])
  expect(selectedAddress.length).toBe(2)

  // Select other address and check if selection works
  userEvent.click(getByText(otherAddress))
  await waitFor(() => expect(getAllByText(otherAddress).length).toBe(2))

  // Click "I understand" and finally enable submisson
  const iUnderstandCheckbox = getByLabelText('I understand')
  userEvent.click(iUnderstandCheckbox)
})

test('Exchange - too low external amount', async () => {
  const onNext = jest.fn()
  const onCancel = jest.fn()

  const transparentAddresses = [TRANSPARENT_ADDRESS_1, TRANSPARENT_ADDRESS_2]

  const {getByText} = glacierWrappedRender(
    <Exchange
      visible
      minimumThreshold={new BigNumber(toWei(1))}
      externalAmount={new BigNumber(0)}
      minimumDustAmount={DUST_AMOUNT}
      availableDust={new BigNumber(1000000)}
      transparentAddresses={transparentAddresses}
      onNext={onNext}
      onCancel={onCancel}
    />,
  )

  expect(getByText('ETC account balance should be at least 1 ETC')).toBeInTheDocument()
})

test('Select Claim Method', async () => {
  const onPrivateKey = jest.fn()
  const onMessageCreate = jest.fn()
  const onMessageUseSigned = jest.fn()

  const {getByText} = glacierWrappedRender(
    <SelectMethod
      visible
      onPrivateKey={onPrivateKey}
      onMessageCreate={onMessageCreate}
      onMessageUseSigned={onMessageUseSigned}
    />,
  )

  // Description is shown
  expect(
    getByText(
      'You can register for Dust using two methods. Please, select the most appropriate for you.',
    ),
  ).toBeInTheDocument()

  // Link to website is shown
  const websiteLink = getByText('read more on website')
  expect(websiteLink).toBeInTheDocument()

  // Buttons correctly call the callbacks
  await expectCalledOnClick(() => getByText('Continue'), onPrivateKey)
  await expectCalledOnClick(() => getByText('Create'), onMessageCreate)
  await expectCalledOnClick(() => getByText('Use Signed'), onMessageUseSigned)
})

test('Verify Address', async () => {
  const onNext = jest.fn()
  const onCancel = jest.fn()

  const {getByText} = glacierWrappedRender(
    <VerifyAddress
      visible
      externalAddress={ETC_ADDRESS}
      transparentAddress={TRANSPARENT_ADDRESS_1}
      onCancel={onCancel}
      onNext={onNext}
    />,
  )

  // Next & Cancel buttons work
  await expectCalledOnClick(() => getByText('Generate Message'), onNext)
  await expectCalledOnClick(() => getByText('Cancel'), onCancel)

  // Info is shown
  expect(getByText(ETC_ADDRESS)).toBeInTheDocument()
  expect(getByText(TRANSPARENT_ADDRESS_1)).toBeInTheDocument()
})

test('Generated Message', async () => {
  const onNext = jest.fn()

  const {getByText} = glacierWrappedRender(
    <GeneratedMessage
      visible
      externalAddress={ETC_ADDRESS}
      transparentAddress={TRANSPARENT_ADDRESS_1}
      onNext={onNext}
    />,
  )

  await expectCalledOnClick(() => getByText('Confirm'), onNext)
})

test('Claim with Private Key', async () => {
  const onNext = jest.fn()
  const onCancel = jest.fn()

  const {getByLabelText, getByText, queryByText} = glacierWrappedRender(
    <ClaimWithKey
      visible
      externalAmount={EXTERNAL_AMOUNT}
      minimumDustAmount={DUST_AMOUNT}
      transparentAddress={TRANSPARENT_ADDRESS_1}
      onNext={onNext}
      onCancel={onCancel}
      chain={fooChain}
    />,
  )

  // Find Submit Button
  const submitButton = getByText(UNLOCK_BUTTON_TEXT)

  // External asset is shown
  expect(getByText(EXTERNAL_AS_SRT)).toBeInTheDocument()

  // Estimated dust reward is shown
  expect(getByText('Estimated Dust')).toBeInTheDocument()
  expect(getByText(DUST_AS_STR)).toBeInTheDocument()

  // Note is shown that it's only the minimum amount
  expect(getByText('(The minimum amount of Dust you’ll get)')).toBeInTheDocument()

  // Destination transparent address is shown
  expect(getByText(TRANSPARENT_ADDRESS_1)).toBeInTheDocument()

  //
  // Private key validation works correctly
  //

  // Find Private Key Input
  const privateKeyInput = getByLabelText(
    `${fooChain.symbol} Private Key from your ${fooChain.symbol} Wallet`,
  )

  // Submit button can be clicked but it shows a dialog validation error
  userEvent.click(submitButton)
  await waitFor(() => expect(getByText(DIALOG_VALIDATION_ERROR)).toBeInTheDocument())

  // Message is shown that the key must be set
  expect(getByText(PRIVATE_KEY_MUST_BE_SET_MSG)).toBeInTheDocument()

  // Enter invalid private key
  fireEvent.change(privateKeyInput, {
    target: {value: 'INVALID KEY'},
  })

  // Message is shown that the key is invalid
  await waitFor(() => expect(getByText(PRIVATE_KEY_INVALID_MSG)).toBeInTheDocument())

  // Enter valid private key
  fireEvent.change(privateKeyInput, {
    target: {value: ETC_PRIVATE_KEY},
  })

  // Error messages are not shown
  await waitFor(() => expect(queryByText(PRIVATE_KEY_MUST_BE_SET_MSG)).not.toBeInTheDocument())
  await waitFor(() => expect(queryByText(PRIVATE_KEY_INVALID_MSG)).not.toBeInTheDocument())

  // Accept warning
  const shouldKeepOpenCheckbox = getByLabelText(
    'I’m aware that I have to keep my Luna wallet open during unlocking',
  )
  userEvent.click(shouldKeepOpenCheckbox)

  // After clicking Submit button no dialog validation error should show up
  userEvent.click(submitButton)
  await waitFor(() => expect(queryByText(DIALOG_VALIDATION_ERROR)).not.toBeInTheDocument())
})

test('Claim with Message', async () => {
  const signedMessage =
    '0x69c65b149b6b7a9aa8c1f7c48e795501f4186c12ec6f43385dcb04dc222600ed3120d38ddd006f96bd83c749a2f42ddd51f77f12395b3a4feb6ffbb6fe1ded261c'

  const onNext = jest.fn()
  const onCancel = jest.fn()

  const {getByLabelText, getByText, queryByText} = glacierWrappedRender(
    <ClaimWithMessage
      visible
      externalAmount={EXTERNAL_AMOUNT}
      minimumDustAmount={DUST_AMOUNT}
      transparentAddress={TRANSPARENT_ADDRESS_1}
      onNext={onNext}
      onCancel={onCancel}
      chain={fooChain}
    />,
  )

  // Find Submit Button
  const submitButton = getByText(UNLOCK_BUTTON_TEXT)

  // External asset is shown
  expect(getByText(EXTERNAL_AS_SRT)).toBeInTheDocument()

  // Estimated dust reward is shown
  expect(getByText('Estimated Dust')).toBeInTheDocument()
  expect(getByText(DUST_AS_STR)).toBeInTheDocument()

  // Note is shown that it's only the minimum amount
  expect(getByText('(The minimum amount of Dust you’ll get)')).toBeInTheDocument()

  // Destination transparent address is shown
  expect(getByText(TRANSPARENT_ADDRESS_1)).toBeInTheDocument()

  //
  // Signed message validation works correctly
  //

  // Find Signed Message Input
  const signedMessageInput = getByLabelText('Input Signed Message')

  // Submit button can be clicked but it shows a dialog validation error
  userEvent.click(submitButton)
  await waitFor(() => expect(getByText(DIALOG_VALIDATION_ERROR)).toBeInTheDocument())

  // Message is shown that the signed message must be set
  expect(getByText(MESSAGE_MUST_BE_SET_TEXT)).toBeInTheDocument()

  // Enter invalid private key
  fireEvent.change(signedMessageInput, {
    target: {value: 'AN INVALID MESSAGE'},
  })
  userEvent.click(submitButton)

  // Accept warning
  const shouldKeepOpenCheckbox = getByLabelText(
    'I’m aware that I have to keep my Luna wallet open during unlocking',
  )
  userEvent.click(shouldKeepOpenCheckbox)

  // Message is shown that the key is invalid
  await waitFor(() => expect(getByText(INVALID_SIGNED_MESSAGE_TEXT)).toBeInTheDocument())

  // Enter valid signed message
  fireEvent.change(signedMessageInput, {
    target: {value: signedMessage},
  })

  // After clicking Submit button no dialog validation error should show up
  userEvent.click(submitButton)
  await waitFor(() => expect(queryByText(MESSAGE_MUST_BE_SET_TEXT)).not.toBeInTheDocument())
  await waitFor(() => expect(queryByText(INVALID_SIGNED_MESSAGE_TEXT)).not.toBeInTheDocument())
})

test('ClaimController - basic render', async () => {
  const setActiveModal = jest.fn()
  const onFinish = jest.fn()

  const WrappedClaimController = ({activeModal}: {activeModal: ModalId}): JSX.Element => {
    const walletState = WalletState.useContainer() as LoadedState

    return (
      <ClaimController
        walletState={walletState}
        totalAtomToBeDistributed={new BigNumber(2)}
        minimumThreshold={new BigNumber(1)}
        activeModal={activeModal}
        setActiveModal={setActiveModal}
        onFinish={onFinish}
      />
    )
  }

  const modalIds: ModalId[] = [
    'none',
    'EnterAddress',
    'Exchange',
    'SelectMethod',
    'VerifyAddress',
    'GeneratedMessage',
    'ClaimWithKey',
    'ClaimWithMessage',
  ]

  modalIds.map((activeModal) =>
    glacierWrappedRender(<WrappedClaimController activeModal={activeModal} />),
  )
})
