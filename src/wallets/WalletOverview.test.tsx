import '@testing-library/jest-dom/extend-expect'
import React from 'react'
import BigNumber from 'bignumber.js'
import {render} from '@testing-library/react'
import {WalletOverview} from './WalletOverview'
import {WalletState, WalletStatus} from '../common/wallet-state'
import {BuildJobState} from '../common/build-job-state'
import {SettingsState} from '../settings-state'
import {makeWeb3Worker} from '../web3'
import {mockWeb3Worker} from '../web3-mock'
import {abbreviateAmountForEnUS} from '../common/test-helpers'
import {UNITS} from '../common/units'
import {BackendState} from '../common/backend-state'

const {Dust} = UNITS

const web3 = makeWeb3Worker(mockWeb3Worker)

test('WalletOverview shows properly formatted balance', () => {
  const confidential = Dust.toBasic(new BigNumber(12345))
  const transparent = Dust.toBasic(new BigNumber(98765))
  const pending = Dust.toBasic(new BigNumber(3456789))
  const total = confidential.plus(transparent).plus(pending)

  const balance = {
    confidential,
    transparent,
    pending,
  }

  const initialState = {walletStatus: 'LOADED' as WalletStatus, web3}
  const {getByText} = render(
    <SettingsState.Provider>
      <BuildJobState.Provider initialState={{web3}}>
        <WalletState.Provider initialState={initialState}>
          <BackendState.Provider initialState={{web3}}>
            <WalletOverview {...balance} />
          </BackendState.Provider>
        </WalletState.Provider>
      </BuildJobState.Provider>
    </SettingsState.Provider>,
  )

  const numbers = [confidential, transparent, total].map((big) => {
    return abbreviateAmountForEnUS(Dust.fromBasic(big)).strict
  })

  numbers.map((formattedNumber) => {
    // abbreviated numbers are present
    expect(getByText(formattedNumber)).toBeInTheDocument()
  })
})
