import React from 'react'
import {Popover} from 'antd'
import BigNumber from 'bignumber.js'
import {useFormatters} from '../settings-state'
import {ETC_CHAIN} from './chains'

interface ShortNumberProps {
  big: BigNumber | number
  decimals?: number
  showSign?: boolean
  content?: React.ReactNode
}

export const ShortNumber = ({
  big: maybeBig,
  decimals = ETC_CHAIN.decimals,
  showSign = false,
  content = null,
}: ShortNumberProps): JSX.Element => {
  const {abbreviateAmount} = useFormatters()

  const big = new BigNumber(maybeBig)
  const {relaxed, strict} = abbreviateAmount(big.shiftedBy(-decimals))
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
