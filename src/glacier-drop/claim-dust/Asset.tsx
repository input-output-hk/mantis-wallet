import React, {PropsWithChildren} from 'react'
import SVG from 'react-inlinesvg'
import BigNumber from 'bignumber.js'
import {Chain} from '../../common/chains'
import {ShortNumber} from '../../common/ShortNumber'
import './Asset.scss'

interface AssetProps {
  chain: Chain
  amount: BigNumber
}

export const Asset = ({chain, amount, children}: PropsWithChildren<AssetProps>): JSX.Element => {
  return (
    <div className="Asset">
      <div className="label">{children}</div>
      <div className="container">
        <div className="logo">
          <SVG src={chain.logo} />
        </div>
        <div className="amount">
          <ShortNumber big={amount} unit={chain.unitType} /> {chain.symbol}
        </div>
      </div>
    </div>
  )
}
