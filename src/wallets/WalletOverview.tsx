import React from 'react'
import SVG from 'react-inlinesvg'
import BigNumber from 'bignumber.js'
import _ from 'lodash'
import {ThemeState} from '../theme-state'
import {LoadedState} from '../common/wallet-state'
import {PropsWithWalletState, withStatusGuard} from '../common/wallet-status-guard'
import {ShortNumber} from '../common/ShortNumber'
import {bigToNumber} from '../common/util'
import {OverviewGraph} from './OverviewGraph'
import {SyncStatusContent} from '../common/SyncStatus'
import dustIconDark from '../assets/dark/dust.png'
import dustIconLight from '../assets/light/dust.png'
import clockIcon from '../assets/icons/clock.svg'
import sumIcon from '../assets/icons/sum.svg'
import confidentialIcon from '../assets/icons/confidential.svg'
import transparentIcon from '../assets/icons/transparent.svg'
import './WalletOverview.scss'

interface WalletOverviewProps {
  pending: BigNumber
  confidential: BigNumber
  transparent: BigNumber
}

const _WalletOverview = ({
  pending,
  confidential,
  transparent,
  walletState,
}: PropsWithWalletState<WalletOverviewProps, LoadedState>): JSX.Element => {
  const themeState = ThemeState.useContainer()
  const dustIcon = themeState.theme === 'dark' ? dustIconDark : dustIconLight
  const available = confidential.plus(transparent)
  const total = pending.plus(available)

  return (
    <div className="WalletOverview">
      <div className="header">
        <span className="main-title">Wallet Overview</span>
        <SyncStatusContent syncStatus={walletState.syncStatus} />
      </div>
      <div className="graph">
        <OverviewGraph {..._.mapValues({pending, confidential, transparent}, bigToNumber)} />
      </div>
      <div className="total">
        <div className="box-text">Available Balance</div>
        <div className="box-amount-big">
          <img src={dustIcon} alt="dust" className="dust" />
          <ShortNumber big={available} />
        </div>
        <div className="box-text">
          <span className="box-icon">
            &nbsp;
            <SVG src={clockIcon} className="svg" />
          </span>
          <span className="uppercase">Pending Amount</span> · <ShortNumber big={pending} />
        </div>
        <div className="box-text">
          <span className="box-icon">
            &nbsp;
            <SVG src={sumIcon} className="svg" />
          </span>
          <span className="uppercase">Total Balance</span> · <ShortNumber big={total} />
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
          <img src={dustIcon} alt="dust" className="dust" />
          <ShortNumber big={transparent} />
        </div>
      </div>
    </div>
  )
}

export const WalletOverview = withStatusGuard(_WalletOverview, 'LOADED')
