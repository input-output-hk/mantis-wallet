import React, {PropsWithChildren} from 'react'
import SVG from 'react-inlinesvg'
import classnames from 'classnames'
import BigNumber from 'bignumber.js'
import {StopOutlined} from '@ant-design/icons'
import {useFormatters} from '../../settings-state'
import {ShortNumber} from '../ShortNumber'
import {ETC_CHAIN} from '../chains'
import {UNITS} from '../units'
import './DialogShowAmount.scss'

interface DialogShowAmountProps {
  amount: BigNumber
  displayExact?: boolean
}

const ShowAmount = ({amount, displayExact}: DialogShowAmountProps): JSX.Element => {
  const {abbreviateAmount} = useFormatters()

  if (!amount.isFinite()) {
    return <StopOutlined />
  }

  return displayExact ? (
    <>{abbreviateAmount(UNITS[ETC_CHAIN.unitType].fromBasic(amount)).relaxed}</>
  ) : (
    <ShortNumber big={amount} />
  )
}

export const DialogShowAmount = ({
  amount,
  displayExact,
  children,
}: PropsWithChildren<DialogShowAmountProps>): JSX.Element => {
  const invalid = !amount.isPositive()

  return (
    <div className="DialogShowAmount">
      <div className="label">{children}</div>
      <div className={classnames('container', {invalid})}>
        <div className="logo">
          <SVG src={ETC_CHAIN.logo} title={ETC_CHAIN.symbol} className="asset-icon svg" />
        </div>
        <div className="amount">
          <ShowAmount amount={amount} displayExact={displayExact} /> {ETC_CHAIN.symbol}
        </div>
      </div>
    </div>
  )
}
