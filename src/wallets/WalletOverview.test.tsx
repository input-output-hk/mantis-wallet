import '@testing-library/jest-dom/extend-expect'
import React from 'react'
import BigNumber from 'bignumber.js'
import {render} from '@testing-library/react'
import {WalletOverview} from './WalletOverview'
import {WalletState} from '../common/wallet-state'
import {ThemeState} from '../theme-state'
import {toWei, fromWei} from 'web3/lib/utils/utils.js'
import {abbreviateAmount} from '../common/formatters'

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

  const {getByText} = render(
    <ThemeState.Provider>
      <WalletState.Provider>
        <WalletOverview {...balance} />
      </WalletState.Provider>
    </ThemeState.Provider>,
  )

  const numbers = Object.values({...balance, total}).map((big) => fromWei(big))

  numbers.map((num) => {
    const numberElem = getByText(abbreviateAmount(num, 2))
    // abbreviated numbers are present
    expect(numberElem).toBeInTheDocument()
  })
})
