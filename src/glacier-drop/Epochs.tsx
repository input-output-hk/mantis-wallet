import React from 'react'
import BigNumber from 'bignumber.js'
import _ from 'lodash'
import SVG from 'react-inlinesvg'
import classnames from 'classnames'
import {ModalProps} from 'antd/lib/modal'
import {useFormatters} from '../settings-state'
import {LunaModal} from '../common/LunaModal'
import {ShortNumber} from '../common/ShortNumber'
import checkIcon from '../assets/icons/check.svg'
import clockIcon from '../assets/icons/clock.svg'
import {PeriodConfig} from './glacier-state'
import {getCurrentEpoch, getSecondsUntilNextEpoch, getUnfrozenAmount} from './Period'
import {Trans} from '../common/Trans'
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
  const {toDurationString} = useFormatters()

  const {numberOfEpochs: maximumNumberOfEpochs} = periodConfig
  const currentEpoch = getCurrentEpoch(currentBlock, periodConfig)
  const secondsUntilNextEpoch = getSecondsUntilNextEpoch(currentBlock, periodConfig)

  const isEpochPending = (shownEpoch: number): boolean => shownEpoch > currentEpoch

  const epochIndices = _.range(1, maximumNumberOfEpochs + 1)
  const tableStyle = {
    gridTemplateColumns: `2fr 1fr repeat(${maximumNumberOfEpochs}, 1fr)`,
    width: `${maximumNumberOfEpochs * 175}px`,
  }

  return (
    <LunaModal wrapClassName="Epochs" width="1000px" {...props}>
      <div className="main-title">
        <Trans k={['glacierDrop', 'title', 'epochs']} />
        {currentEpoch < maximumNumberOfEpochs && (
          <span className="epoch-timer">
            <SVG src={clockIcon} className="clock icon" />
            <Trans
              k={['glacierDrop', 'message', 'epochNFinishes']}
              values={{currentEpoch, duration: toDurationString(secondsUntilNextEpoch)}}
            />
          </span>
        )}
      </div>
      <div className="table-container">
        <div className="epochs-table" style={tableStyle}>
          {/* Epochs Header */}
          <div className="header">
            <Trans k={['glacierDrop', 'epochHeader', 'midnightAddress']} />
          </div>
          <div className="header">
            <Trans k={['glacierDrop', 'epochHeader', 'totalDust']} />
          </div>
          {epochIndices.map((epochNumber) => (
            <div
              className={classnames('header', {pending: isEpochPending(epochNumber)})}
              key={epochNumber}
            >
              <Trans k={['glacierDrop', 'epochHeader', 'epochNumber']} values={{epochNumber}} />
              {!isEpochPending(epochNumber) && <SVG src={checkIcon} className="checked icon" />}
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
                        <Trans k={['glacierDrop', 'message', 'totalDust']} />
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
