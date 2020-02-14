import React from 'react'
import {Popover} from 'antd'
import BigNumber from 'bignumber.js'
import {abbreviateNumber, formatAmount} from './formatters'
import {bigToNumber} from './util'

interface ShortNumberProps {
  big: BigNumber
}

export const ShortNumber = (props: ShortNumberProps): JSX.Element => {
  const number = bigToNumber(props.big)
  return (
    <Popover content={formatAmount(number)} placement="bottom">
      {abbreviateNumber(number)}
    </Popover>
  )
}
