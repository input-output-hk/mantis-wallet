import React, {useState, FunctionComponent} from 'react'
import _ from 'lodash/fp'
import SVG from 'react-inlinesvg'
import {LoadingOutlined} from '@ant-design/icons'
import {config, loadMantisWalletStatus} from './config/renderer'
import {fillActionHandlers} from './common/util'
import {useInterval} from './common/hook-utils'
import {StatusModal} from './common/StatusModal'
import {rendererLog} from './common/logger'
import {Trans} from './common/Trans'
import {TKeyRenderer} from './common/i18n'
import logo from './assets/logoCrop.svg'
import wordmark from './assets/wordmark.svg'
import './SplashScreen.scss'

const getStatusMessage = (mantisWalletStatus: MantisWalletStatus): TKeyRenderer => {
  if (mantisWalletStatus.node.status === 'notRunning') {
    return ['common', 'initializationStatus', 'startingNode']
  } else if (mantisWalletStatus.node.status === 'running') {
    return ['common', 'initializationStatus', 'connectingToNode']
  }

  // this is just a safe fallback, the code shouldn't get here
  rendererLog.warn('Unexpected backend status...')
  rendererLog.warn(mantisWalletStatus)
  return ['common', 'initializationStatus', 'loading']
}

export const SplashScreen: FunctionComponent<{}> = () => {
  const [showStatus, setShowStatus] = useState(false)
  const [mantisWalletStatus, setMantisWalletStatus] = useState(loadMantisWalletStatus)

  useInterval(() => setMantisWalletStatus(_.clone(loadMantisWalletStatus())), 200)

  const message = getStatusMessage(mantisWalletStatus)

  return (
    <div className="SplashScreen">
      <StatusModal
        status={mantisWalletStatus}
        config={config}
        visible={showStatus}
        onCancel={() => setShowStatus(false)}
      />
      <SVG src={logo} className="logo" />
      <div className="title">
        <SVG src={wordmark} />
      </div>
      <div className="spinner">
        <LoadingOutlined spin />
      </div>
      <div className="loading">
        <Trans k={message} />
      </div>
      <div className="details" {...fillActionHandlers(() => setShowStatus(true))}>
        <Trans k={['common', 'link', 'showDetails']} />
      </div>
    </div>
  )
}
