import React, {useState, useEffect} from 'react'
import {Switch} from 'antd'
import {EmptyProps} from 'antd/lib/empty'
import {ThemeState} from './theme-state'
import {withStatusGuard} from './common/wallet-status-guard'
import {updateMiningConfig, ipcRemoveAllListeners, ipcListen} from './common/ipc-util'
import {NoWallet} from './wallets/NoWallet'
import {HeaderWithSyncStatus} from './common/HeaderWithSyncStatus'
import {MiningConfigModal, miningConfigChannels} from './RemoteSettingsManager'
import {loadLunaManagedConfig} from './config/renderer'
import './Settings.scss'
import {LunaManagedConfig} from './config/type'
import {IPCToRendererChannelName} from './shared/ipc-types'

const SettingsWrapper = ({children}: React.PropsWithChildren<EmptyProps>): JSX.Element => {
  return (
    <div className="Settings">
      <HeaderWithSyncStatus>Settings</HeaderWithSyncStatus>
      <div className="content">{children}</div>
    </div>
  )
}

const _Settings = (): JSX.Element => {
  const themeState = ThemeState.useContainer()
  const [lunaManagedConfig, setLunaManagedConfig] = useState<LunaManagedConfig>(
    loadLunaManagedConfig(),
  )
  const [miningConfigModalShown, setMiningConfigModalShown] = useState<boolean>(false)

  const reloadConfig = (): void => setLunaManagedConfig(loadLunaManagedConfig())

  const reloadTriggers: IPCToRendererChannelName[] = ['disable-mining-success']

  // subscribe on mount
  useEffect(() => {
    reloadTriggers.forEach((channel) => ipcListen(channel, () => reloadConfig()))
  }, [])

  // unsubscribe on unmount
  useEffect(() => () => reloadTriggers.forEach(ipcRemoveAllListeners), [])

  const updateMiningState = (miningEnabled: boolean): void => {
    if (!miningEnabled) {
      updateMiningConfig(null)
    } else {
      setMiningConfigModalShown(true)
    }
  }

  return (
    <SettingsWrapper>
      <div className="settings-item">
        <div className="settings-label">Enable Dark Mode</div>
        <div className="settings-input">
          <Switch
            checked={themeState.theme === 'dark'}
            onChange={() => themeState.switchTheme(themeState.theme === 'dark' ? 'light' : 'dark')}
          />
        </div>
      </div>
      <div className="settings-item">
        <div className="settings-label">Enable Mining</div>
        <div className="settings-input">
          <Switch
            checked={lunaManagedConfig.miningEnabled}
            onChange={(checked) => updateMiningState(checked)}
          />
        </div>
      </div>
      <MiningConfigModal
        visible={miningConfigModalShown}
        onCancel={() => {
          miningConfigChannels.forEach(ipcRemoveAllListeners)
          setMiningConfigModalShown(false)
        }}
        onFinish={() => {
          reloadConfig()
        }}
      />
    </SettingsWrapper>
  )
}

export const Settings = withStatusGuard(_Settings, 'LOADED', () => (
  <SettingsWrapper>
    <div className="no-wallet-container">
      <NoWallet />
    </div>
  </SettingsWrapper>
))
