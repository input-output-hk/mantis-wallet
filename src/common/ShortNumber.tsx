import React from 'react'
import {Popover} from 'antd'
import BigNumber from 'bignumber.js'
import {abbreviateAmount} from './formatters'
import {UnitType, UNITS} from './units'

interface ShortNumberProps {
  big: BigNumber | number
  unit?: UnitType
  showSign?: boolean
  content?: React.ReactNode
}

export const ShortNumber = ({
  big: maybeBig,
  unit = 'Dust',
  showSign = false,
  content = null,
}: ShortNumberProps): JSX.Element => {
  const big = new BigNumber(maybeBig)
  const {relaxed, strict} = abbreviateAmount(UNITS[unit].fromBasic(big))
  const prefix = showSign && big.isGreaterThan(0) ? '+' : ''

  return (
    <Popover content={content ? content : relaxed} placement="bottom">
      {prefix}
      {strict}
    </Popover>
  )
}
