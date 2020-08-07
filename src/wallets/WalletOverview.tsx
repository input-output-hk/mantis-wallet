import React from 'react'
import SVG from 'react-inlinesvg'
import BigNumber from 'bignumber.js'
import _ from 'lodash'
import {Popover} from 'antd'
import {SettingsState} from '../settings-state'
import {ShortNumber} from '../common/ShortNumber'
import {Link} from '../common/Link'
import {LINKS} from '../external-link-config'
import {HeaderWithSyncStatus} from '../common/HeaderWithSyncStatus'
import {OverviewGraph} from './OverviewGraph'
import dustIconDark from '../assets/dark/dust.png'
import dustIconLight from '../assets/light/dust.png'
import confidentialIcon from '../assets/icons/confidential.svg'
import transparentIcon from '../assets/icons/transparent.svg'
import {isTestnet} from '../shared/version'
import {BackendState} from '../common/backend-state'
import {WalletViewMode} from './Wallet'
import {Trans} from '../common/Trans'
import './WalletOverview.scss'

interface WalletOverviewProps {
  pending: BigNumber
  confidential: BigNumber
  transparent: BigNumber
  viewType?: WalletViewMode
}

export const WalletOverview = ({
  pending,
  confidential,
  transparent,
  viewType,
}: WalletOverviewProps): JSX.Element => {
  const {theme} = SettingsState.useContainer()
  const {networkTag} = BackendState.useContainer()
  const dustIcon = theme === 'dark' ? dustIconDark : dustIconLight
  const available = confidential.plus(transparent)
  const total = pending.plus(available)

  const transparentTooltip = (
    <p style={{width: '350px'}}>
      These funds are transparent and can be visible to other Midnight users, we recommend you move
      them to a confidential address.
      {viewType !== 'accounts' && (
        <>
          <br />
          <b>To view your transparent balances, click the Transparent Accounts button below.</b>
        </>
      )}
    </p>
  )

  return (
    <div className="WalletOverview">
      <div className="header">
        <HeaderWithSyncStatus>Wallet Overview</HeaderWithSyncStatus>
        {isTestnet(networkTag) && (
          <div>
            <Trans k={['title', 'testnetEdition']} />
          </div>
        )}
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
        <div className="transparent">
          <Popover content={transparentTooltip}>
            <div>
              <div className="box-text">
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
