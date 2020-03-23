import React from 'react'
import BigNumber from 'bignumber.js'
import {ThemeState} from '../../theme-state'
import {ShortNumber} from '../ShortNumber'
import {DUST_SYMBOL} from '../../pob/chains'
import dustIconDark from '../../assets/dark/dust.png'
import dustIconLight from '../../assets/light/dust.png'
import './DialogShowDust.scss'

interface DialogShowDustProps {
  amount: BigNumber
}

export const DialogShowDust = ({
  amount,
  children,
}: React.PropsWithChildren<DialogShowDustProps>): JSX.Element => {
  const themeState = ThemeState.useContainer()
  const dustIcon = themeState.theme === 'dark' ? dustIconDark : dustIconLight

  return (
    <div className="DialogShowDust">
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
