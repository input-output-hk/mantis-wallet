import React from 'react'
import SVG from 'react-inlinesvg'
import './WalletOverview.scss'

interface WalletOverviewProps {
  pending: number
  confidental: number
  transparent: number
}

interface Point {
  x: number
  y: number
}

const formatAmount = (n: number): string => new Intl.NumberFormat('en-US').format(n)

// Code inspired by
// https://stackoverflow.com/questions/5736398/how-to-calculate-the-svg-path-for-an-arc-of-a-circle
function polarToCartesian(
  centerX: number,
  centerY: number,
  radius: number,
  angleInPercent: number,
): Point {
  const angleInRadians = ((angleInPercent - 0.25) * Math.PI) / 0.5

  return {
    x: centerX + radius * Math.cos(angleInRadians),
    y: centerY + radius * Math.sin(angleInRadians),
  }
}

const OverviewGraph = (props: WalletOverviewProps): JSX.Element => {
  const c = {x: 50, y: 50}
  const r = 45
  const {pending, confidental, transparent} = props
  const total = pending + confidental + transparent

  const confPct = confidental / total
  const tranPct = transparent / total
  const pendPct = pending / total

  const start = polarToCartesian(c.x, c.y, r, 0)
  const confEnd = polarToCartesian(c.x, c.y, r, confPct)
  const tranEnd = polarToCartesian(c.x, c.y, r, tranPct + confPct)
  const pendEnd = polarToCartesian(c.x, c.y, r, 1)

  const confLargeArcFlag = confPct <= 0.5 ? '0' : '1'
  const tranLargeArcFlag = tranPct <= 0.5 ? '0' : '1'
  const pendLargeArcFlag = pendPct <= 0.5 ? '0' : '1'

  return (
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" className="graph-svg">
      <circle cx={c.x} cy={c.y} r={r + 4.5} />
      <path
        fill="none"
        className="graph-confidential"
        strokeWidth="10"
        d={`M ${confEnd.x} ${confEnd.y} A ${r} ${r} 0 ${confLargeArcFlag} 0 ${start.x} ${start.y}`}
      />
      <path
        fill="none"
        className="graph-transparent"
        strokeWidth="10"
        d={`M ${tranEnd.x} ${tranEnd.y} A ${r} ${r} 0 ${tranLargeArcFlag} 0 ${confEnd.x} ${confEnd.y}`}
      />
      <path
        fill="none"
        className="graph-pending"
        strokeWidth="10"
        d={`M ${pendEnd.x} ${pendEnd.y} A ${r} ${r} 0 ${pendLargeArcFlag} 0 ${tranEnd.x} ${tranEnd.y}`}
      />
    </svg>
  )
}

const WalletOverview = (props: WalletOverviewProps): JSX.Element => {
  const {pending, confidental, transparent} = props
  const total = pending + confidental + transparent
  return (
    <div className="WalletOverview">
      <h2 className="title">Overview Wallet</h2>
      <div className="refresh">
        <SVG src="/icons/refresh.svg" className="svg" />
      </div>
      <div className="graph">
        <OverviewGraph {...props} />
      </div>
      <div className="total">
        <div className="box-text">Total Balance</div>
        <div className="box-amount-big">
          <img src="/dust_logo.png" alt="dust" className="dust" />
          {formatAmount(total)}
        </div>
        <div className="box-text">
          <span className="box-icon">
            &nbsp;
            <SVG src="/icons/clock.svg" className="svg" />
          </span>
          Pending Amount · {formatAmount(pending)}
        </div>
      </div>
      <div className="confidental">
        <div className="box-text">
          <span className="box-icon">
            &nbsp;
            <SVG src="/icons/confidental.svg" className="svg" />
          </span>
          Confidental
        </div>
        <div className="box-amount">
          <img src="/dust_logo.png" alt="dust" className="dust" />
          {formatAmount(confidental)}
        </div>
      </div>
      <div className="transparent">
        <div className="box-text">
          <div className="box-info">i</div>
          <span className="box-icon">
            &nbsp;
            <SVG src="/icons/transparent.svg" className="svg" />
          </span>
          Transparent
        </div>
        <div className="box-amount">
          <img src="/dust_logo.png" alt="dust" className="dust" />
          {formatAmount(transparent)}
        </div>
      </div>
    </div>
  )
}

export default WalletOverview
