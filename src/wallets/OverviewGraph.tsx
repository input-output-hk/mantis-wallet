import React from 'react'
import {Popover} from 'antd'
import {useFormatters} from '../settings-state'
import './OverviewGraph.scss'

interface OverviewGraphProps {
  confidential: number
  transparent: number
  pending: number
}

interface Point {
  x: number
  y: number
}

function polarToCartesian(center: Point, radius: number, angleInRatio: number): Point {
  // angle in radians shifted with a quarter (so the graph starts in the top)
  const angleInRadians = 2.0 * ((angleInRatio - 0.25) * Math.PI)

  return {
    x: center.x + radius * Math.cos(angleInRadians),
    y: center.y + radius * Math.sin(angleInRadians),
  }
}

export const OverviewGraph = (props: OverviewGraphProps): JSX.Element => {
  const {formatPercentage} = useFormatters()

  const c = {x: 50, y: 50}
  const r = 45
  const {confidential, transparent, pending} = props
  const realTotal = confidential + transparent + pending
  const total = realTotal * 1.00001 // without this, it won't work when only one variable is set

  // compute the ratio to full circle of each piece in the graph
  const confRatio = confidential / total
  const tranRatio = transparent / total
  const pendRatio = pending / total

  // having each piece's ratio, compute where each arc ends
  // the starting point of each arc is the ending point of the previous one
  const start = polarToCartesian(c, r, 0)
  const confEnd = polarToCartesian(c, r, confRatio)
  const tranEnd = polarToCartesian(c, r, tranRatio + confRatio)
  const pendEnd = polarToCartesian(c, r, 0.99999)

  // these flags inidicate which arc should be drawn (larger / smaller)
  const confLargeArcFlag = confRatio <= 0.5 ? '0' : '1'
  const tranLargeArcFlag = tranRatio <= 0.5 ? '0' : '1'
  const pendLargeArcFlag = pendRatio <= 0.5 ? '0' : '1'

  const popoverText = (
    <>
      {formatPercentage(confRatio)}% Confidential
      <br />
      {formatPercentage(tranRatio)}% Transparent
      <br />
      {formatPercentage(pendRatio)}% Pending
    </>
  )

  return (
    <Popover content={popoverText} placement="bottom">
      <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" className="graph-svg">
        {total > 0 && (
          <>
            <path
              fill="none"
              className="graph-confidential"
              strokeWidth="2"
              d={`M ${confEnd.x} ${confEnd.y} A ${r} ${r} 0 ${confLargeArcFlag} 0 ${start.x} ${start.y}`}
            />
            <path
              fill="none"
              className="graph-transparent"
              strokeWidth="2"
              d={`M ${tranEnd.x} ${tranEnd.y} A ${r} ${r} 0 ${tranLargeArcFlag} 0 ${confEnd.x} ${confEnd.y}`}
            />
            <path
              fill="none"
              className="graph-pending"
              strokeWidth="2"
              d={`M ${pendEnd.x} ${pendEnd.y} A ${r} ${r} 0 ${pendLargeArcFlag} 0 ${tranEnd.x} ${tranEnd.y}`}
            />
          </>
        )}
        {total == 0 && (
          <path
            fill="none"
            className="graph-empty"
            strokeWidth="2"
            d={`M ${pendEnd.x} ${pendEnd.y} A ${r} ${r} 0 1 0 ${start.x} ${start.y}`}
          />
        )}
      </svg>
    </Popover>
  )
}
