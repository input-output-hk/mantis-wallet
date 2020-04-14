import React from 'react'
import SVG from 'react-inlinesvg'
import BigNumber from 'bignumber.js'
import _ from 'lodash'
import {ThemeState} from '../theme-state'
import {ShortNumber} from '../common/ShortNumber'
import {OverviewGraph} from './OverviewGraph'
import {HeaderWithSyncStatus} from '../common/HeaderWithSyncStatus'
import dustIconDark from '../assets/dark/dust.png'
import dustIconLight from '../assets/light/dust.png'
import confidentialIcon from '../assets/icons/confidential.svg'
import transparentIcon from '../assets/icons/transparent.svg'
import './WalletOverview.scss'

interface WalletOverviewProps {
  pending: BigNumber
  confidential: BigNumber
  transparent: BigNumber
}

export const WalletOverview = ({
  pending,
  confidential,
  transparent,
}: WalletOverviewProps): JSX.Element => {
  const themeState = ThemeState.useContainer()
  const dustIcon = themeState.theme === 'dark' ? dustIconDark : dustIconLight
  const available = confidential.plus(transparent)
  const total = pending.plus(available)

  return (
    <div className="WalletOverview">
      <div className="header">
        <HeaderWithSyncStatus>Wallet Overview</HeaderWithSyncStatus>
      </div>
      <div className="balances">
        <div className="total">
          <div className="graph">
            <OverviewGraph
              {..._.mapValues({pending, confidential, transparent}, (b) => b.toNumber())}
            />
          </div>
          <div className="box-text">Total Balance</div>
          <div className="box-amount">
            <img src={dustIcon} alt="dust" className="dust" />
            <ShortNumber big={total} />
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
    </div>
  )
}
