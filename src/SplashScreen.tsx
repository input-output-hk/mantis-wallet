import React, {useState, FunctionComponent} from 'react'
import {LoadingOutlined} from '@ant-design/icons'
import _ from 'lodash/fp'
import {LunaWalletLoader} from 'luna-wallet-loader'
import {config, loadLunaManagedConfig, loadLunaStatus} from './config/renderer'
import {SettingsState} from './settings-state'
import {fillActionHandlers} from './common/util'
import {useInterval} from './common/hook-utils'
import {StatusModal} from './common/StatusModal'
import {rendererLog} from './common/logger'
import {Trans} from './common/Trans'
import {TKeyRenderer} from './common/i18n'
import './SplashScreen.scss'

const getStatusMessage = (lunaStatus: LunaStatus): TKeyRenderer => {
  if (lunaStatus.fetchParams.status === 'not-running') {
    return ['common', 'initializationStatus', 'initLuna']
  } else if (lunaStatus.fetchParams.status === 'running') {
    return ['common', 'initializationStatus', 'sonicsParamsFetching']
  } else if (lunaStatus.fetchParams.status === 'finished') {
    return ['common', 'initializationStatus', 'startingMidnight']
  } else if (lunaStatus.node.status === 'running' && lunaStatus.wallet.status === 'running') {
    return ['common', 'initializationStatus', 'connectingToWallet']
  }

  // this is just a safe fallback, the code shouldn't get here
  rendererLog.warn('Unexpected backend status...')
  rendererLog.warn(lunaStatus)
  return ['common', 'initializationStatus', 'loading']
}

export const SplashScreen: FunctionComponent<{}> = () => {
  const {theme} = SettingsState.useContainer()

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
      <div className="title">
        <Trans k={['title', 'luna']} />
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
