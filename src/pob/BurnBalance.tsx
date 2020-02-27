import React from 'react'
import SVG from 'react-inlinesvg'
import BigNumber from 'bignumber.js'
import {Chain} from './chains'
import {ShortNumber} from '../common/ShortNumber'
import clockIcon from '../assets/icons/clock.svg'
import sumIcon from '../assets/icons/sum.svg'
import './BurnBalance.scss'

export interface BurnBalanceProps {
  chain: Chain
  total: BigNumber
  pending: BigNumber
}

export const BurnBalance: React.FunctionComponent<BurnBalanceProps> = ({
  chain,
  total,
  pending,
}: BurnBalanceProps) => (
  <div className="BurnBalance">
    <div className="logo-container">
      <SVG src={chain.burnLogo} className="logo" />
    </div>
    <div className="available">
      Available{' '}
      <span className="amount">
        <ShortNumber big={total.minus(pending)} dp={2} /> M-{chain.symbol}
      </span>
    </div>
    <div className="rest">
      <SVG src={clockIcon} className="icon" />
      Pending Amount · <ShortNumber big={pending} dp={2} /> M-{chain.symbol}
    </div>
    <div className="rest">
      <SVG src={sumIcon} className="icon" />
      Total Amount · <ShortNumber big={total} dp={2} /> M-{chain.symbol}
    </div>
  </div>
)
