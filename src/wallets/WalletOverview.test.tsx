import '@testing-library/jest-dom/extend-expect'
import React from 'react'
import {render} from '@testing-library/react'
import Web3 from 'web3'
import {WalletOverview} from './WalletOverview'
import {WalletState, WalletStatus} from '../common/wallet-state'
import {SettingsState} from '../settings-state'
import {BackendState} from '../common/backend-state'
import {asEther} from '../common/units'

const web3 = new Web3()

it('shows properly formatted balance in WalletOverview', () => {
  const availableBalance = asEther(12345)

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

  expect(getByText('12345.000 ETC')).toBeInTheDocument()
})
