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
import {getCurrentEpoch, getSecondsUntilNextEpoch} from './Period'
import './Epochs.scss'

interface EpochsProps {
  epochRows: EpochRow[]
  periodConfig: PeriodConfig
  currentBlock: number
}

export interface EpochRow {
  walletId: number
  transparentAddress: string
  dustAmount: BigNumber
}

export const Epochs = ({
  epochRows,
  periodConfig,
  currentBlock,
  ...props
}: EpochsProps & ModalProps): JSX.Element => {
  const {numberOfEpochs} = periodConfig
  const currentEpoch = getCurrentEpoch(currentBlock, periodConfig)
  const secondsUntilNextEpoch = getSecondsUntilNextEpoch(currentBlock, periodConfig, currentEpoch)

  const isEpochPending = (shownEpoch: number): boolean => shownEpoch > currentEpoch

  const epochIndices = _.range(1, numberOfEpochs + 1)
  const tableStyle = {
    gridTemplateColumns: `1fr 2fr 1fr repeat(${numberOfEpochs}, 1fr)`,
    width: `${numberOfEpochs * 175}px`,
  }

  return (
    <LunaModal destroyOnClose wrapClassName="Epochs" width="1000px" {...props}>
      <div className="main-title">
        Epochs
        {currentEpoch < numberOfEpochs && (
          <span className="epoch-timer">
            <SVG src={clockIcon} className="clock icon" />
            Epoch {currentEpoch} finishes in {toDurationString(secondsUntilNextEpoch)}
          </span>
        )}
      </div>
      <div className="table-container">
        <div className="epochs-table" style={tableStyle}>
          {/* Epochs Header */}
          <div className="header wallet-id">Wallet ID</div>
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
            const amountPerEpoch = epochRow.dustAmount.dividedBy(numberOfEpochs)
            const {walletId, transparentAddress, dustAmount} = epochRow
            return (
              <React.Fragment key={epochRowIndex}>
                <div>Wallet #{walletId}</div>
                <div className="address">{transparentAddress}</div>
                <div className="dust-amount">
                  <ShortNumber big={dustAmount} />
                </div>
                {epochIndices.map((epochNum) => (
                  <div key={epochNum} className={classnames({pending: isEpochPending(epochNum)})}>
                    <ShortNumber big={amountPerEpoch.multipliedBy(epochNum)} />
                  </div>
                ))}
              </React.Fragment>
            )
          })}
        </div>
      </div>
    </LunaModal>
  )
}
