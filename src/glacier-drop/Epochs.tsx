import React from 'react'
import BigNumber from 'bignumber.js'
import _ from 'lodash'
import SVG from 'react-inlinesvg'
import classnames from 'classnames'
import {ModalProps} from 'antd/lib/modal'
import {toDurationString} from '../common/formatters'
import {LunaModal} from '../common/LunaModal'
import {ShortNumber} from '../common/ShortNumber'
import checkIcon from '../assets/icons/check.svg'
import clockIcon from '../assets/icons/clock.svg'
import {PeriodConfig} from './glacier-state'
import {getCurrentEpoch, getSecondsUntilNextEpoch, getUnfrozenAmount} from './Period'
import './Epochs.scss'

export interface EpochRow {
  transparentAddress: string
  dustAmount: BigNumber
  numberOfEpochs: number
}

interface EpochsProps {
  epochRows: EpochRow[]
  periodConfig: PeriodConfig
  currentBlock: number
}

export const Epochs = ({
  epochRows,
  periodConfig,
  currentBlock,
  ...props
}: EpochsProps & ModalProps): JSX.Element => {
  const {numberOfEpochs: maximumNumberOfEpochs} = periodConfig
  const currentEpoch = getCurrentEpoch(currentBlock, periodConfig)
  const secondsUntilNextEpoch = getSecondsUntilNextEpoch(currentBlock, periodConfig, currentEpoch)

  const isEpochPending = (shownEpoch: number): boolean => shownEpoch > currentEpoch

  const epochIndices = _.range(1, maximumNumberOfEpochs + 1)
  const tableStyle = {
    gridTemplateColumns: `2fr 1fr repeat(${maximumNumberOfEpochs}, 1fr)`,
    width: `${maximumNumberOfEpochs * 175}px`,
  }

  return (
    <LunaModal wrapClassName="Epochs" width="1000px" {...props}>
      <div className="main-title">
        Epochs
        {currentEpoch < maximumNumberOfEpochs && (
          <span className="epoch-timer">
            <SVG src={clockIcon} className="clock icon" />
            Epoch {currentEpoch} finishes in {toDurationString(secondsUntilNextEpoch)}
          </span>
        )}
      </div>
      <div className="table-container">
        <div className="epochs-table" style={tableStyle}>
          {/* Epochs Header */}
          <div className="header">Midnight Address</div>
          <div className="header">Total Dust</div>
          {epochIndices.map((epochNum) => (
            <div
              className={classnames('header', {pending: isEpochPending(epochNum)})}
              key={epochNum}
            >
              Epoch {epochNum}
              {!isEpochPending(epochNum) && <SVG src={checkIcon} className="checked icon" />}
            </div>
          ))}

          {/* Epoch Rows */}
          {epochRows.map((epochRow, epochRowIndex) => {
            const {transparentAddress, dustAmount} = epochRow
            return (
              <React.Fragment key={epochRowIndex}>
                <div className="address">{transparentAddress}</div>
                <div className="dust-amount">
                  <ShortNumber big={dustAmount} />
                </div>
                {epochIndices.map((epochNum) => {
                  const unfrozenAmountAtEpoch = getUnfrozenAmount(
                    dustAmount,
                    epochNum,
                    epochRow.numberOfEpochs,
                  )
                  return (
                    <div key={epochNum} className={classnames({pending: isEpochPending(epochNum)})}>
                      {unfrozenAmountAtEpoch.isEqualTo(dustAmount) ? (
                        'Total Dust'
                      ) : (
                        <ShortNumber big={unfrozenAmountAtEpoch} />
                      )}
                    </div>
                  )
                })}
              </React.Fragment>
            )
          })}
        </div>
      </div>
    </LunaModal>
  )
}
