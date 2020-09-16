import '@testing-library/jest-dom/extend-expect'
import React from 'react'
import BigNumber from 'bignumber.js'
import {render} from '@testing-library/react'
import Web3 from 'web3'
import {WalletOverview} from './WalletOverview'
import {WalletState, WalletStatus} from '../common/wallet-state'
import {SettingsState} from '../settings-state'
import {abbreviateAmountForEnUS} from '../common/test-helpers'
import {UNITS} from '../common/units'
import {BackendState} from '../common/backend-state'

const {Ether} = UNITS

const web3 = new Web3()

test('WalletOverview shows properly formatted balance', () => {
  const availableEther = new BigNumber(12345)
  const availableBalance = Ether.toBasic(availableEther)

  const initialState = {walletStatus: 'LOADED' as WalletStatus, web3}
  const {getByText} = render(
    <SettingsState.Provider>
      <WalletState.Provider initialState={initialState}>
        <BackendState.Provider initialState={{web3}}>
          <WalletOverview availableBalance={availableBalance} />
        </BackendState.Provider>
      </WalletState.Provider>
    </SettingsState.Provider>,
  )

  const formattedNumber = abbreviateAmountForEnUS(Ether.fromBasic(availableBalance)).strict
  expect(getByText(formattedNumber)).toBeInTheDocument()
})
