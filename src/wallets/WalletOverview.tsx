import React from 'react'
import SVG from 'react-inlinesvg'
import {OverviewGraph} from './OverviewGraph'
import {formatAmount} from '../common/formatters'
import './WalletOverview.scss'

interface WalletOverviewProps {
  pending: number
  confidental: number
  transparent: number
}

export const WalletOverview = (props: WalletOverviewProps): JSX.Element => {
  const {pending, confidental, transparent} = props
  const total = pending + confidental + transparent
  return (
    <div className="WalletOverview">
      <div className="title">Overview Wallet</div>
      <div className="refresh">
        <SVG src="./icons/refresh.svg" className="svg" />
      </div>
      <div className="graph">
        <OverviewGraph {...props} />
      </div>
      <div className="total">
        <div className="box-text">Total Balance</div>
        <div className="box-amount-big">
          <img src="./dust_logo.png" alt="dust" className="dust" />
          {formatAmount(total)}
        </div>
        <div className="box-text">
          <span className="box-icon">
            &nbsp;
            <SVG src="./icons/clock.svg" className="svg" />
          </span>
          Pending Amount · {formatAmount(pending)}
        </div>
      </div>
      <div className="confidental">
        <div className="box-text">
          <span className="box-icon">
            &nbsp;
            <SVG src="./icons/confidental.svg" className="svg" />
          </span>
          Confidental
        </div>
        <div className="box-amount">
          <img src="./dust_logo.png" alt="dust" className="dust" />
          {formatAmount(confidental)}
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
          {formatAmount(transparent)}
        </div>
      </div>
    </div>
  )
}
