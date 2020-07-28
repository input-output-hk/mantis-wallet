import React, {FunctionComponent} from 'react'
import BigNumber from 'bignumber.js'
import SVG from 'react-inlinesvg'
import {ShortNumber} from '../common/ShortNumber'
import clockIcon from '../assets/icons/clock.svg'
import sumIcon from '../assets/icons/sum.svg'
import {PobChain} from './pob-chains'
import './BurnBalanceDisplay.scss'

interface BurnBalanceDisplayProps {
  chain: PobChain
  pending: BigNumber
  available: BigNumber
}

export const BurnBalanceDisplay: FunctionComponent<BurnBalanceDisplayProps> = ({
  chain,
  available,
  pending,
}: BurnBalanceDisplayProps) => {
  const tokenSymbol = `M-${chain.symbol}`
  return (
    <div className="BurnBalanceDisplay">
      <div className="logo-container">
        <SVG src={chain.burnLogo} className="logo" />
      </div>
      <div className="available">
        Available{' '}
        <span className="amount">
          <ShortNumber big={available} unit={chain.unitType} /> {tokenSymbol}
        </span>
      </div>
      <div className="rest">
        <SVG src={clockIcon} className="icon" />
        Pending Amount · <ShortNumber big={pending} unit={chain.unitType} /> {tokenSymbol}
      </div>
      <div className="rest">
        <SVG src={sumIcon} className="icon" />
        Total Amount · <ShortNumber big={available.plus(pending)} unit={chain.unitType} />{' '}
        {tokenSymbol}
      </div>
    </div>
  )
}
