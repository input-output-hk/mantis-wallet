import React from 'react'
import {Popover} from 'antd'
import BigNumber from 'bignumber.js'
import {abbreviateAmount} from './formatters'
import {UnitType, UNITS} from './units'

interface ShortNumberProps {
  big: BigNumber | number
  unit?: UnitType
}

export const ShortNumber = ({big: maybeBig, unit = 'Dust'}: ShortNumberProps): JSX.Element => {
  const big = new BigNumber(maybeBig)
  const {relaxed, strict} = abbreviateAmount(UNITS[unit].fromBasic(big))

  return (
    <Popover content={relaxed} placement="bottom">
      {strict}
    </Popover>
  )
}
