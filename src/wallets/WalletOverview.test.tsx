import '@testing-library/jest-dom/extend-expect'
import React from 'react'
import BigNumber from 'bignumber.js'
import {render} from '@testing-library/react'
import {toWei, fromWei} from 'web3/lib/utils/utils.js'
import {WalletOverview} from './WalletOverview'
import {WalletState, WalletStatus} from '../common/wallet-state'
import {ThemeState} from '../theme-state'
import {makeWeb3Worker} from '../web3'
import {mockWeb3Worker} from '../web3-mock'
import {abbreviateAmount} from '../common/formatters'

const web3 = makeWeb3Worker(mockWeb3Worker)

jest.mock('../config/renderer.ts')

test('WalletOverview shows properly formatted balance', () => {
  const confidential = toWei(new BigNumber(12345))
  const transparent = toWei(new BigNumber(98765))
  const pending = toWei(new BigNumber(3456789))
  const total = confidential.plus(transparent).plus(pending)

  const balance = {
    confidential,
    transparent,
    pending,
  }

  const initialState = {walletStatus: 'LOADED' as WalletStatus, web3}
  const {getByText} = render(
    <ThemeState.Provider>
      <WalletState.Provider initialState={initialState}>
        <WalletOverview {...balance} />
      </WalletState.Provider>
    </ThemeState.Provider>,
  )

  const numbers = Object.values({...balance, total}).map((big) => {
    return abbreviateAmount(fromWei(big)).strict
  })

  numbers.map((formattedNumber) => {
    const numberElem = getByText(formattedNumber)
    // abbreviated numbers are present
    expect(numberElem).toBeInTheDocument()
  })
})
