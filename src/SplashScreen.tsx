import React, {useState} from 'react'
import {Icon} from 'antd'
import _ from 'lodash/fp'
import {LunaWalletLoader} from 'luna-wallet-loader'
import {config, loadLunaManagedConfig, loadLunaStatus} from './config/renderer'
import {ThemeState} from './theme-state'
import {useInterval} from './common/hook-utils'
import {StatusModal} from './common/StatusModal'
import './SplashScreen.scss'

const getStatusMessage = (lunaStatus: LunaStatus): string => {
  if (lunaStatus.fetchParams.status === 'not-running') {
    return 'Initializing Luna'
  } else if (lunaStatus.fetchParams.status === 'running') {
    return 'Sapling params fetching'
  } else if (lunaStatus.fetchParams.status === 'finished') {
    return 'Starting Midnight node'
  } else if (lunaStatus.node.status === 'running' && lunaStatus.wallet.status === 'running') {
    return 'Connecting to wallet'
  }

  // this is just a safe fallback, the code shouldn't get here
  console.warn('Unexpected backend status...')
  console.warn(lunaStatus)
  return 'Loading'
}

export const SplashScreen: React.FunctionComponent<{}> = () => {
  const {theme} = ThemeState.useContainer()

  const [showStatus, setShowStatus] = useState(false)
  const [lunaStatus, setLunaStatus] = useState(loadLunaStatus)

  useInterval(() => setLunaStatus(_.clone(loadLunaStatus())), 200)

  const message = getStatusMessage(lunaStatus)

  return (
    <div className="SplashScreen">
      <StatusModal
        status={lunaStatus}
        config={config}
        managedConfig={loadLunaManagedConfig()}
        visible={showStatus}
        onCancel={() => setShowStatus(false)}
      />
      <LunaWalletLoader className="logo" mode={theme} />
      <div className="title">Luna</div>
      <div className="spinner">
        <Icon type="loading" spin />
      </div>
      <div className="loading">{message}</div>
      <div className="details" onClick={() => setShowStatus(true)}>
        Show details
      </div>
    </div>
  )
}
