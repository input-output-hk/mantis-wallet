import React, {useState, useEffect} from 'react'
import _ from 'lodash/fp'
import {Switch} from 'antd'
import {EmptyProps} from 'antd/lib/empty'
import {SettingsState, TIME_FORMATS, DATE_FORMATS} from './settings-state'
import {IPCToRendererChannelName} from './shared/ipc-types'
import {withStatusGuard} from './common/wallet-status-guard'
import {updateMiningConfig, ipcRemoveAllListeners, ipcListenToMain} from './common/ipc-util'
import {HeaderWithSyncStatus} from './common/HeaderWithSyncStatus'
import {DialogDropdown} from './common/dialog/DialogDropdown'
import {NoWallet} from './wallets/NoWallet'
import {MiningConfigModal, miningConfigChannels} from './RemoteSettingsManager'
import {loadLunaManagedConfig} from './config/renderer'
import {LunaManagedConfig} from './config/type'
import './Settings.scss'

const SettingsWrapper = ({children}: React.PropsWithChildren<EmptyProps>): JSX.Element => {
  return (
    <div className="Settings">
      <HeaderWithSyncStatus>Settings</HeaderWithSyncStatus>
      <div className="content">{children}</div>
    </div>
  )
}

const _Settings = (): JSX.Element => {
  const {
    theme,
    switchTheme,
    timeFormat,
    setTimeFormat,
    dateFormat,
    setDateFormat,
  } = SettingsState.useContainer()

  const [lunaManagedConfig, setLunaManagedConfig] = useState<LunaManagedConfig>(
    loadLunaManagedConfig(),
  )
  const [miningConfigModalShown, setMiningConfigModalShown] = useState<boolean>(false)

  const reloadConfig = (): void => setLunaManagedConfig(loadLunaManagedConfig())
  const reloadTriggers: IPCToRendererChannelName[] = ['disable-mining-success']

  useEffect(() => {
    // subscribe on mount
    reloadTriggers.forEach((channel) => ipcListenToMain(channel, reloadConfig))

    // unsubscribe on unmount
    return () => reloadTriggers.forEach(ipcRemoveAllListeners)
  }, [])

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
            checked={theme === 'dark'}
            onChange={() => switchTheme(theme === 'dark' ? 'light' : 'dark')}
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
      <div className="settings-item">
        <DialogDropdown
          label="Date Format"
          options={DATE_FORMATS}
          defaultOptionIndex={_.indexOf(dateFormat)(DATE_FORMATS)}
          onChange={setDateFormat}
          type="small"
        />
      </div>
      <div className="settings-item">
        <DialogDropdown
          label="Time Format"
          options={TIME_FORMATS}
          defaultOptionIndex={_.indexOf(timeFormat)(TIME_FORMATS)}
          onChange={setTimeFormat}
          type="small"
        />
      </div>
      <MiningConfigModal
        visible={miningConfigModalShown}
        onCancel={() => {
          miningConfigChannels.forEach(ipcRemoveAllListeners)
          setMiningConfigModalShown(false)
        }}
        onFinish={reloadConfig}
      />
    </SettingsWrapper>
  )
}

export const Settings = withStatusGuard(_Settings, 'LOADED', () => (
  <SettingsWrapper>
    <NoWallet />
  </SettingsWrapper>
))
