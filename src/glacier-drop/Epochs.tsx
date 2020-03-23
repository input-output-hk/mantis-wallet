import React from 'react'
import BigNumber from 'bignumber.js'
import _ from 'lodash'
import SVG from 'react-inlinesvg'
import {ModalProps} from 'antd/lib/modal'
import {toDurationString} from '../common/formatters'
import {LunaModal} from '../common/LunaModal'
import {ShortNumber} from '../common/ShortNumber'
import checkIcon from '../assets/icons/check.svg'
import clockIcon from '../assets/icons/clock.svg'
import './Epochs.scss'

interface EpochsProps {
  epochRows: EpochRow[]
  numberOfEpochs: number
  currentEpoch: number
  secondsLeft: number
}

export interface EpochRow {
  walletId: number
  midnightAddress: string
  dustAmount: BigNumber
}

export const Epochs = ({
  epochRows,
  numberOfEpochs,
  currentEpoch,
  secondsLeft,
  ...props
}: EpochsProps & ModalProps): JSX.Element => {
  const getPendingClass = (i: number): string => (i >= currentEpoch ? 'pending' : '')
  const epochIndices = _.range(1, numberOfEpochs + 1)
  const tableStyle = {
    gridTemplateColumns: `1fr 2fr 1fr repeat(${numberOfEpochs}, 1fr)`,
    width: `${numberOfEpochs * 175}px`,
  }

  return (
    <LunaModal destroyOnClose wrapClassName="Epochs" width="1000px" {...props}>
      <div className="main-title">
        Epochs
        <span className="epoch-timer">
          <SVG src={clockIcon} className="clock icon" />
          Epoch {currentEpoch} finishes in {toDurationString(secondsLeft)}
        </span>
      </div>
      <div className="table-container">
        <div className="epochs-table" style={tableStyle}>
          {/* Epochs Header */}
          <div className="header wallet-id">Wallet ID</div>
          <div className="header">Midnight Address</div>
          <div className="header">Total Dust</div>
          {epochIndices.map((i) => (
            <div className={`header ${getPendingClass(i)}`} key={i}>
              Epoch {i}
              {i < currentEpoch && <SVG src={checkIcon} className="checked icon" />}
            </div>
          ))}

          {/* Epoch Rows */}
          {epochRows.map((epochRow) => {
            const amountPerEpoch = epochRow.dustAmount.dividedBy(numberOfEpochs)
            return (
              <>
                <div>Wallet #{epochRow.walletId}</div>
                <div className="address">{epochRow.midnightAddress}</div>
                <div className="dust-amount">
                  <ShortNumber big={epochRow.dustAmount} />
                </div>
                {epochIndices.map((i) => (
                  <div key={i} className={getPendingClass(i)}>
                    <ShortNumber big={amountPerEpoch.multipliedBy(i)} />
                  </div>
                ))}
              </>
            )
          })}
        </div>
      </div>
    </LunaModal>
  )
}
