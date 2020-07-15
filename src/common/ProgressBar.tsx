import React from 'react'
import _ from 'lodash'
import {Progress, Popover} from 'antd'
import {WarningOutlined} from '@ant-design/icons'
import * as styles from '../vars-for-ts.scss'
import './ProgressBar.scss'

export type ProgressState = 'checked' | 'unknown' | 'fail' | 'inProgress' | 'stopped'

interface ProgressBarProps {
  progressState: ProgressState
  ratio: number
  showOfflineWarning?: boolean
}

export const ProgressBar = ({
  progressState,
  ratio,
  showOfflineWarning = false,
}: ProgressBarProps): JSX.Element => {
  switch (progressState) {
    case 'unknown':
      return (
        <div className="ProgressBar">
          <Progress status="normal" percent={0} showInfo={false} />
        </div>
      )
    case 'checked':
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
    case 'fail':
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
    case 'stopped':
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
    case 'inProgress':
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
