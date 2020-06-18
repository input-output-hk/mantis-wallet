import '@testing-library/jest-dom/extend-expect'
import React from 'react'
import BigNumber from 'bignumber.js'
import {render, fireEvent, waitFor, act} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {FeeEstimates} from '../common/wallet-state'
import {RedeemModal} from './modals/RedeemModal'
import {UNITS} from '../common/units'
import {SettingsState} from '../settings-state'

const {Dust} = UNITS

jest.mock('../config/renderer.ts')

test('Redeem works with Full Amount button', async () => {
  const transparentAddress = 'transparent-address'
  const accountBalance = Dust.toBasic(new BigNumber(1234))
  const mediumFeeEstimate = new BigNumber(200)

  const estimateFees = (): Promise<FeeEstimates> =>
    Promise.resolve({
      low: new BigNumber(100),
      medium: mediumFeeEstimate,
      high: new BigNumber(300),
    })

  const redeem = jest.fn()
  const cancel = jest.fn()

  const {getByText, getAllByText, queryByText} = render(
    <SettingsState.Provider>
      <RedeemModal
        redeem={redeem}
        estimateRedeemFee={estimateFees}
        transparentAccount={{
          address: transparentAddress,
          index: 1,
          balance: accountBalance,
          midnightTokens: {},
        }}
        onCancel={cancel}
        visible
      />
    </SettingsState.Provider>,
  )

  // First we wait for the estimates to be loaded
  expect(getByText('Loading estimates')).toBeInTheDocument()
  await waitFor(() => expect(queryByText('Fast')).toBeInTheDocument())

  // When full amount is clicked, estimates should be collapsed
  const fullAmountButton = getByText('Full Amount')
  fireEvent.click(fullAmountButton)
  await waitFor(() => expect(queryByText('Fast')).not.toBeInTheDocument())

  // Apply confidentiality is the name of the title and the button too
  const applyConfidentialityTexts = getAllByText('Apply Confidentiality')
  expect(applyConfidentialityTexts).toHaveLength(2)
  const applyConfidentialityButton = applyConfidentialityTexts[1]

  // If the Apply Confidentiality button is clicked it should be called with the right params
  await act(async () => userEvent.click(applyConfidentialityButton))
  await waitFor(() =>
    expect(redeem).toBeCalledWith(
      transparentAddress,
      accountBalance.minus(mediumFeeEstimate).toNumber(),
      mediumFeeEstimate.toNumber(),
    ),
  )
})
