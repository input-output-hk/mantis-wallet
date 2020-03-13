import React from 'react'
import SVG from 'react-inlinesvg'
import clockIcon from '../assets/icons/clock.svg'
import hourglassIcon from '../assets/icons/hourglass.svg'
import './PeriodStatus.scss'

// TODO: provide types / props when adding logic
// it's not clear what are the options from the design
export const PeriodStatus = (): JSX.Element => {
  return (
    <div className="PeriodStatus">
      <div className="period-info">
        <div className="unlock">
          <div className="unlock-title">
            <SVG src={clockIcon} className="icon" />
            Unlocking Period in Progress
          </div>
          <div className="unlock-detail">
            There are 32 Days 6 Hours and 7 minutes left to unlock Dust
          </div>
        </div>
        <div className="unfreeze">
          <div className="unfreeze-detail">
            <SVG src={hourglassIcon} className="icon hourglass" />
            Unfreezing Period starts in 41 days
          </div>
        </div>
      </div>
      <div className="puzzle-info">
        <div className="title">PoW Puzzle Complete</div>
        <div>You have 5 days to submit your Unlocked Proof for Glacier Drop</div>
      </div>
    </div>
  )
}
