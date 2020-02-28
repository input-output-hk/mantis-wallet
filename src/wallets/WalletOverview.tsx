import React from 'react'
import SVG from 'react-inlinesvg'
import BigNumber from 'bignumber.js'
import _ from 'lodash'
import {WalletState, LoadedState} from '../common/wallet-state'
import {ThemeState} from '../theme-state'
import {ShortNumber} from '../common/ShortNumber'
import {bigToNumber} from '../common/util'
import {OverviewGraph} from './OverviewGraph'
import {SyncStatusContent} from '../common/SyncStatus'
import dustIconDark from '../assets/dark/dust.png'
import dustIconLight from '../assets/light/dust.png'
import clockIcon from '../assets/icons/clock.svg'
import confidentialIcon from '../assets/icons/confidential.svg'
import transparentIcon from '../assets/icons/transparent.svg'
import './WalletOverview.scss'

interface WalletOverviewProps {
  pending: BigNumber
  confidential: BigNumber
  transparent: BigNumber
}

export const WalletOverview = (props: WalletOverviewProps): JSX.Element => {
  const state = WalletState.useContainer() as LoadedState
  const themeState = ThemeState.useContainer()
  const dustIcon = themeState.theme === 'dark' ? dustIconDark : dustIconLight

  const {pending, confidential, transparent} = props
  const total = pending.plus(confidential).plus(transparent)
  return (
    <div className="WalletOverview">
      <div className="header">
        <span className="title">Wallet Overview</span>
        <SyncStatusContent syncStatus={state.syncStatus} />
      </div>
      <div className="graph">
        <OverviewGraph {..._.mapValues(props, bigToNumber)} />
      </div>
      <div className="total">
        <div className="box-text">Total Balance</div>
        <div className="box-amount-big">
          <img src={dustIcon} alt="dust" className="dust" />
          <ShortNumber big={total} dp={2} />
        </div>
        <div className="box-text">
          <span className="box-icon">
            &nbsp;
            <SVG src={clockIcon} className="svg" />
          </span>
          Pending Amount · <ShortNumber big={pending} dp={2} />
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
          <img src={dustIcon} alt="dust" className="dust" />
          <ShortNumber big={confidential} dp={2} />
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
          <img src={dustIcon} alt="dust" className="dust" />
          <ShortNumber big={transparent} dp={2} />
        </div>
      </div>
    </div>
  )
}
