import React from 'react'
import {Popover} from 'antd'
import _ from 'lodash'
import BigNumber from 'bignumber.js'
import {fromWei} from 'web3/lib/utils/utils.js'
import {abbreviateAmount} from './formatters'
import {fromSatoshi} from './util'

export type UnitType = 'Dust' | 'Ether' | 'Bitcoin' | 'exact'

const transform: Record<UnitType, (b: BigNumber) => BigNumber> = {
  Dust: fromWei,
  Ether: fromWei,
  Bitcoin: fromSatoshi,
  exact: _.identity,
}

interface ShortNumberProps {
  big: BigNumber
  unit?: UnitType
}

export const ShortNumber = ({big, unit = 'Dust'}: ShortNumberProps): JSX.Element => {
  const {relaxed, strict} = abbreviateAmount(transform[unit](big))

  return (
    <Popover content={relaxed} placement="bottom">
      {strict}
    </Popover>
  )
}
