import React, {PropsWithChildren} from 'react'
import classnames from 'classnames'
import BigNumber from 'bignumber.js'
import {StopOutlined} from '@ant-design/icons'
import {SettingsState, useFormatters} from '../../settings-state'
import {ShortNumber} from '../ShortNumber'
import {DST_CHAIN} from '../chains'
import {UNITS} from '../units'
import dustIconDark from '../../assets/dark/dust.png'
import dustIconLight from '../../assets/light/dust.png'
import './DialogShowDust.scss'

interface DialogShowDustProps {
  amount: BigNumber
  displayExact?: boolean
}

const ShowAmount = ({amount, displayExact}: DialogShowDustProps): JSX.Element => {
  const {abbreviateAmount} = useFormatters()

  if (!amount.isFinite()) {
    return <StopOutlined />
  }

  return displayExact ? (
    <>{abbreviateAmount(UNITS[DST_CHAIN.unitType].fromBasic(amount)).relaxed}</>
  ) : (
    <ShortNumber big={amount} />
  )
}

export const DialogShowDust = ({
  amount,
  displayExact,
  children,
}: PropsWithChildren<DialogShowDustProps>): JSX.Element => {
  const {theme} = SettingsState.useContainer()
  const dustIcon = theme === 'dark' ? dustIconDark : dustIconLight
  const invalid = !amount.isPositive()

  return (
    <div className="DialogShowDust">
      <div className="label">{children}</div>
      <div className={classnames('container', {invalid})}>
        <div className="logo">
          <img src={dustIcon} alt="dust" className="dust" />
        </div>
        <div className="amount">
          <ShowAmount amount={amount} displayExact={displayExact} /> {DST_CHAIN.symbol}
        </div>
      </div>
    </div>
  )
}
