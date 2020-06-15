import '@testing-library/jest-dom/extend-expect'
import React from 'react'
import BigNumber from 'bignumber.js'
import {render} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {WalletOverview} from './WalletOverview'
import {WalletState, WalletStatus} from '../common/wallet-state'
import {BuildJobState} from '../common/build-job-state'
import {ThemeState} from '../theme-state'
import {makeWeb3Worker} from '../web3'
import {mockWeb3Worker} from '../web3-mock'
import {abbreviateAmount} from '../common/formatters'
import {UNITS} from '../common/units'
import {BackendState} from '../common/backend-state'

const {Dust} = UNITS

const web3 = makeWeb3Worker(mockWeb3Worker)

jest.mock('../config/renderer.ts')

test('WalletOverview shows properly formatted balance', () => {
  const confidential = Dust.toBasic(new BigNumber(12345))
  const transparent = Dust.toBasic(new BigNumber(98765))
  const pending = Dust.toBasic(new BigNumber(3456789))
  const total = confidential.plus(transparent).plus(pending)

  const setViewType = jest.fn()

  const balance = {
    confidential,
    transparent,
    pending,
  }

  const initialState = {walletStatus: 'LOADED' as WalletStatus, web3}
  const {getByText} = render(
    <ThemeState.Provider>
      <BuildJobState.Provider initialState={{web3}}>
        <WalletState.Provider initialState={initialState}>
          <BackendState.Provider initialState={{web3}}>
            <WalletOverview {...balance} goToAccounts={setViewType} />
          </BackendState.Provider>
        </WalletState.Provider>
      </BuildJobState.Provider>
    </ThemeState.Provider>,
  )

  const numbers = [confidential, transparent, total].map((big) => {
    return abbreviateAmount(Dust.fromBasic(big)).strict
  })

  numbers.map((formattedNumber) => {
    // abbreviated numbers are present
    expect(getByText(formattedNumber)).toBeInTheDocument()
  })

  const transparentBalance = getByText('Transparent', {exact: false})
  userEvent.click(transparentBalance)
  expect(setViewType).toBeCalled()
})
