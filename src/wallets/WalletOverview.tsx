import React from 'react'
import SVG from 'react-inlinesvg'
import BigNumber from 'bignumber.js'
import _ from 'lodash'
import {Popover} from 'antd'
import {LUNA_EDITION} from '../shared/version'
import {ThemeState} from '../theme-state'
import {ShortNumber} from '../common/ShortNumber'
import {Link} from '../common/Link'
import {LINKS} from '../external-link-config'
import {HeaderWithSyncStatus} from '../common/HeaderWithSyncStatus'
import {OverviewGraph} from './OverviewGraph'
import dustIconDark from '../assets/dark/dust.png'
import dustIconLight from '../assets/light/dust.png'
import confidentialIcon from '../assets/icons/confidential.svg'
import transparentIcon from '../assets/icons/transparent.svg'
import './WalletOverview.scss'

interface WalletOverviewProps {
  pending: BigNumber
  confidential: BigNumber
  transparent: BigNumber
  goToAccounts: () => void
}

export const WalletOverview = ({
  pending,
  confidential,
  transparent,
  goToAccounts,
}: WalletOverviewProps): JSX.Element => {
  const themeState = ThemeState.useContainer()
  const dustIcon = themeState.theme === 'dark' ? dustIconDark : dustIconLight
  const available = confidential.plus(transparent)
  const total = pending.plus(available)

  const transparentTooltip = (
    <p>
      These funds are transparent and can be visible to other Midnight users,
      <br />
      we recommened you move them to a confidental address.
      <br />
      <b>To view your Transparent balances, click here.</b>
    </p>
  )

  return (
    <div className="WalletOverview">
      <div className="header">
        <HeaderWithSyncStatus>Wallet Overview</HeaderWithSyncStatus>
        <div>{LUNA_EDITION}</div>
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
          <div className="get-dust">
            <Link href={LINKS.faucet}>Where to get Dust?</Link>
          </div>
        </div>
        <div className="transparent" onClick={goToAccounts}>
          <Popover content={transparentTooltip}>
            <div>
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
          </Popover>
        </div>
      </div>
    </div>
  )
}
