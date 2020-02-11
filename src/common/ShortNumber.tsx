import React from 'react'
import {Popover} from 'antd'
import BigNumber from 'bignumber.js'
import {formatAmount, abbreviateAmount} from './formatters'
import {fromWei} from 'web3/lib/utils/utils.js'

interface ShortNumberProps {
  big: BigNumber
  dp?: number
}

export const ShortNumber = ({big, dp = 6}: ShortNumberProps): JSX.Element => {
  const dust = fromWei(big)

  return (
    <Popover content={formatAmount(dust)} placement="bottom">
      {abbreviateAmount(dust, dp)}
    </Popover>
  )
}
