import '@testing-library/jest-dom/extend-expect'
import React from 'react'
import Big from 'big.js'
import {render} from '@testing-library/react'
import {WalletOverview} from './WalletOverview'
import {WalletState} from '../common/wallet-state'
import {abbreviateNumber} from '../common/formatters'
import {bigToNumber} from '../common/util'

jest.mock('../config/renderer.ts')

test('WalletOverview shows properly formatted balance', () => {
  const confidential = Big(12345)
  const transparent = Big(98765)
  const pending = Big(3456789)
  const total = confidential.plus(transparent).plus(pending)

  const balance = {
    confidential,
    transparent,
    pending,
  }

  const {getByText} = render(
    <WalletState.Provider>
      <WalletOverview {...balance} />
    </WalletState.Provider>,
  )

  const numbers = Object.values({...balance, total}).map((big) => bigToNumber(big))

  numbers.map((num) => {
    const numberElem = getByText(abbreviateNumber(num))
    // abbreviated numbers are present
    expect(numberElem).toBeInTheDocument()
  })
})
