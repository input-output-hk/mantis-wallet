import React from 'react'
import SVG from 'react-inlinesvg'
import Big from 'big.js'
import _ from 'lodash'
import {WalletState} from '../common/wallet-state'
import {ShortNumber} from '../common/ShortNumber'
import {bigToNumber} from '../common/util'
import {OverviewGraph} from './OverviewGraph'
import dustLogo from '../assets/dust_logo.png'
import refreshIcon from '../assets/icons/refresh.svg'
import clockIcon from '../assets/icons/clock.svg'
import confidentialIcon from '../assets/icons/confidential.svg'
import transparentIcon from '../assets/icons/transparent.svg'
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
        <SVG src={refreshIcon} className="svg" onClick={refresh} />
      </div>
      <div className="graph">
        <OverviewGraph {..._.mapValues(props, bigToNumber)} />
      </div>
      <div className="total">
        <div className="box-text">Total Balance</div>
        <div className="box-amount-big">
          <img src={dustLogo} alt="dust" className="dust" />
          <ShortNumber big={total} />
        </div>
        <div className="box-text">
          <span className="box-icon">
            &nbsp;
            <SVG src={clockIcon} className="svg" />
          </span>
          Pending Amount · <ShortNumber big={pending} />
        </div>
      </div>
      <div className="confidential">
        <div className="box-text">
          <span className="box-icon">
            &nbsp;
            <SVG src={confidentialIcon} className="svg" />
          </span>
          Confidential
        </div>
        <div className="box-amount">
          <img src={dustLogo} alt="dust" className="dust" />
          <ShortNumber big={confidential} />
        </div>
      </div>
      <div className="transparent">
        <div className="box-text">
          <div className="box-info">i</div>
          <span className="box-icon">
            &nbsp;
            <SVG src={transparentIcon} className="svg" />
          </span>
          Transparent
        </div>
        <div className="box-amount">
          <img src={dustLogo} alt="dust" className="dust" />
          <ShortNumber big={transparent} />
        </div>
      </div>
    </div>
  )
}
