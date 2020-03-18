import React from 'react'
import BigNumber from 'bignumber.js'
import {ThemeState} from '../../theme-state'
import {ShortNumber} from '../../common/ShortNumber'
import {DUST_SYMBOL} from '../../pob/chains'
import dustIconDark from '../../assets/dark/dust.png'
import dustIconLight from '../../assets/light/dust.png'
import './EstimatedDust.scss'

interface EstimatedDustProps {
  amount: BigNumber
}

export const EstimatedDust = ({
  amount,
  children,
}: React.PropsWithChildren<EstimatedDustProps>): JSX.Element => {
  const themeState = ThemeState.useContainer()
  const dustIcon = themeState.theme === 'dark' ? dustIconDark : dustIconLight

  return (
    <div className="EstimatedDust">
      <div className="label">{children}</div>
      <div className="container">
        <div className="logo">
          <img src={dustIcon} alt="dust" className="dust" />
        </div>
        <div className="amount">
          <ShortNumber big={amount} /> {DUST_SYMBOL}
        </div>
      </div>
    </div>
  )
}
