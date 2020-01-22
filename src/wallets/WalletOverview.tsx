import React from 'react'
import SVG from 'react-inlinesvg'
import Big from 'big.js'
import _ from 'lodash'
import {WalletState} from '../common/wallet-state'
import {ShortNumber} from '../common/ShortNumber'
import {bigToNumber} from '../common/util'
import {OverviewGraph} from './OverviewGraph'
import './WalletOverview.scss'

interface WalletOverviewProps {
  pending: Big
  confidential: Big
  transparent: Big
}

export const WalletOverview = (props: WalletOverviewProps): JSX.Element => {
  const walletState = WalletState.useContainer()

  const refresh = (): void => {
    if (walletState.walletStatus === 'LOADED') walletState.reset()
  }

  const {pending, confidential, transparent} = props
  const total = pending.plus(confidential).plus(transparent)
  return (
    <div className="WalletOverview">
      <div className="title">Overview Wallet</div>
      <div className="refresh">
        <SVG src="./icons/refresh.svg" className="svg" onClick={refresh} />
      </div>
      <div className="graph">
        <OverviewGraph {..._.mapValues(props, bigToNumber)} />
      </div>
      <div className="total">
        <div className="box-text">Total Balance</div>
        <div className="box-amount-big">
          <img src="./dust_logo.png" alt="dust" className="dust" />
          <ShortNumber big={total} />
        </div>
        <div className="box-text">
          <span className="box-icon">
            &nbsp;
            <SVG src="./icons/clock.svg" className="svg" />
          </span>
          Pending Amount · <ShortNumber big={pending} />
        </div>
      </div>
      <div className="confidential">
        <div className="box-text">
          <span className="box-icon">
            &nbsp;
            <SVG src="./icons/confidential.svg" className="svg" />
          </span>
          Confidential
        </div>
        <div className="box-amount">
          <img src="./dust_logo.png" alt="dust" className="dust" />
          <ShortNumber big={confidential} />
        </div>
      </div>
      <div className="transparent">
        <div className="box-text">
          <div className="box-info">i</div>
          <span className="box-icon">
            &nbsp;
            <SVG src="./icons/transparent.svg" className="svg" />
          </span>
          Transparent
        </div>
        <div className="box-amount">
          <img src="./dust_logo.png" alt="dust" className="dust" />
          <ShortNumber big={transparent} />
        </div>
      </div>
    </div>
  )
}
