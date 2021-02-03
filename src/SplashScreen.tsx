import React, {FunctionComponent, useState} from 'react'
import _ from 'lodash/fp'
import SVG from 'react-inlinesvg'
import {LoadingOutlined} from '@ant-design/icons'
import {Select} from 'antd'
import {config, loadMantisWalletStatus} from './config/renderer'
import {fillActionHandlers} from './common/util'
import {useInterval} from './common/hook-utils'
import {StatusModal} from './common/StatusModal'
import {rendererLog} from './common/logger'
import {Trans} from './common/Trans'
import {TKeyRenderer} from './common/i18n'
import logo from './assets/logoCrop.svg'
import wordmark from './assets/wordmark.svg'
import {ChangeNetworkModal} from './wallets/modals/ChangeNetwork'
import {DEFINED_NETWORK_NAMES, displayNameOfNetwork, NetworkName} from './config/type'
import {BackendState} from './common/backend-state'
import {SettingsState} from './settings-state'
import './SplashScreen.scss'

const {Option} = Select

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
  const [isChangeNetworkModalVisible, setChangeNetworkModalVisible] = useState(false)

  useInterval(() => {
    if (!isChangeNetworkModalVisible) {
      setMantisWalletStatus(_.clone(loadMantisWalletStatus()))
    }
  }, 200)

  const {
    translation: {t},
  } = SettingsState.useContainer()

  const {networkName} = BackendState.useContainer()
  const [selectedNetwork, setSelectedNetwork] = useState<NetworkName>(networkName)

  const definedNetworkOptions = DEFINED_NETWORK_NAMES.map((network) => ({
    key: network,
    // FIXME: ETCM-342 remove after upgrading to TS4
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    label: displayNameOfNetwork(network, t),
  }))

  const changeNetwork = (newNetwork: NetworkName): void => {
    setSelectedNetwork(newNetwork)
    setChangeNetworkModalVisible(true)
  }

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
      <div className="switcher">
        <Select onChange={changeNetwork} bordered={false} value={networkName}>
          {definedNetworkOptions.map(({key, label}) => (
            <Option key={key} value={key}>
              {label}
            </Option>
          ))}
        </Select>
      </div>

      <ChangeNetworkModal
        visible={isChangeNetworkModalVisible}
        onCancel={() => {
          setChangeNetworkModalVisible(false)
          setSelectedNetwork(networkName)
        }}
        newNetwork={selectedNetwork}
      />
    </div>
  )
}
