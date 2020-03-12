import React from 'react'
import {Popover} from 'antd'
import BigNumber from 'bignumber.js'
import {fromWei} from 'web3/lib/utils/utils.js'
import {abbreviateAmount} from './formatters'

interface ShortNumberProps {
  big: BigNumber
}

export const ShortNumber = ({big}: ShortNumberProps): JSX.Element => {
  const {relaxed, strict} = abbreviateAmount(fromWei(big))

  return (
    <Popover content={relaxed} placement="bottom">
      {strict}
    </Popover>
  )
}
