import React from 'react'
import {Popover} from 'antd'
import BigNumber from 'bignumber.js'
import {useFormatters} from '../settings-state'
import {UnitType, UNITS} from './units'

interface ShortNumberProps {
  big: BigNumber | number
  unitOrDecimals?: UnitType | number
  showSign?: boolean
  content?: React.ReactNode
}

export const ShortNumber = ({
  big: maybeBig,
  unitOrDecimals = 'Dust',
  showSign = false,
  content = null,
}: ShortNumberProps): JSX.Element => {
  const {abbreviateAmount} = useFormatters()

  const big = new BigNumber(maybeBig)
  const inUnits =
    typeof unitOrDecimals === 'number'
      ? big.shiftedBy(-unitOrDecimals)
      : UNITS[unitOrDecimals].fromBasic(big)
  const {relaxed, strict} = abbreviateAmount(inUnits)
  const prefix = showSign && big.isGreaterThan(0) ? '+' : ''

  return (
    <Popover content={content ? content : relaxed} placement="bottom">
      <span>
        {prefix}
        {strict}
      </span>
    </Popover>
  )
}
