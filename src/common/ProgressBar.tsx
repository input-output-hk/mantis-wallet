import React from 'react'
import _ from 'lodash'
import {Progress, Popover} from 'antd'
import {WarningOutlined} from '@ant-design/icons'
import * as styles from '../vars-for-ts.scss'
import './ProgressBar.scss'

export type ProgressType = 'CHECKED' | 'UNKNOWN' | 'FAILED' | 'IN_PROGRESS' | 'STOPPED'

interface ProgressBarProps {
  progressType: ProgressType
  ratio: number
  showOfflineWarning?: boolean
}

export const ProgressBar = ({
  progressType,
  ratio,
  showOfflineWarning = false,
}: ProgressBarProps): JSX.Element => {
  switch (progressType) {
    case 'UNKNOWN':
      return (
        <div className="ProgressBar">
          <Progress status="normal" percent={0} showInfo={false} />
        </div>
      )
    case 'CHECKED':
      return (
        <div className="ProgressBar">
          <Progress
            strokeColor={styles.successColor}
            status="success"
            percent={100}
            showInfo={false}
          />
        </div>
      )
    case 'FAILED':
      return (
        <div className="ProgressBar">
          <Progress
            strokeColor={styles.errorColor}
            status="exception"
            percent={100}
            showInfo={false}
          />
        </div>
      )
    case 'STOPPED':
      return (
        <div className="ProgressBar">
          <Progress
            strokeColor={styles.warningColor}
            status="normal"
            percent={100}
            showInfo={false}
          />
        </div>
      )
    case 'IN_PROGRESS':
      return (
        <div className="ProgressBar">
          <Progress
            strokeColor={{
              from: styles.successColor,
              to: styles.lunaBlue,
            }}
            status="active"
            percent={100 * _.clamp(ratio, 0, 0.99)}
            showInfo={false}
          />
          {showOfflineWarning && (
            <Popover content="Your wallet is connecting at the moment, the progress might be outdated.">
              <div className="offline-warning">
                <WarningOutlined title="warning" />
              </div>
            </Popover>
          )}
        </div>
      )
  }
}
