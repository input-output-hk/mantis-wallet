import React, {useState, useEffect} from 'react'
import _ from 'lodash/fp'
import {Switch} from 'antd'
import {EmptyProps} from 'antd/lib/empty'
import {SettingsState, TIME_FORMATS, DATE_FORMATS} from './settings-state'
import {IPCToRendererChannelName} from './shared/ipc-types'
import {LoadedState} from './common/wallet-state'
import {withStatusGuard, PropsWithWalletState} from './common/wallet-status-guard'
import {updateMiningConfig, ipcRemoveAllListeners, ipcListenToMain} from './common/ipc-util'
import {HeaderWithSyncStatus} from './common/HeaderWithSyncStatus'
import {DialogDropdown} from './common/dialog/DialogDropdown'
import {NoWallet} from './wallets/NoWallet'
import {ExportPrivateKeyModal} from './wallets/modals/ExportPrivateKey'
import {MiningConfigModal, miningConfigChannels} from './RemoteSettingsManager'
import {loadLunaManagedConfig} from './config/renderer'
import {LunaManagedConfig} from './config/type'
import './Settings.scss'

type ModalId = 'none' | 'MiningConfig' | 'ExportPrivateKey'

const SettingsWrapper = ({children}: React.PropsWithChildren<EmptyProps>): JSX.Element => {
  return (
    <div className="Settings">
      <HeaderWithSyncStatus>Settings</HeaderWithSyncStatus>
      <div className="content">{children}</div>
    </div>
  )
}

const _Settings = ({walletState}: PropsWithWalletState<EmptyProps, LoadedState>): JSX.Element => {
  const {
    theme,
    switchTheme,
    timeFormat,
    setTimeFormat,
    dateFormat,
    setDateFormat,
  } = SettingsState.useContainer()

  const [activeModal, setActiveModal] = useState<ModalId>('none')

  const [lunaManagedConfig, setLunaManagedConfig] = useState<LunaManagedConfig>(
    loadLunaManagedConfig(),
  )
  const reloadConfig = (): void => setLunaManagedConfig(loadLunaManagedConfig())
  const reloadTriggers: IPCToRendererChannelName[] = ['disable-mining-success']

  useEffect(() => {
    reloadTriggers.forEach((channel) => ipcListenToMain(channel, reloadConfig))
    return () => reloadTriggers.forEach(ipcRemoveAllListeners)
  }, [])

  return (
    <SettingsWrapper>
      {/* Theme */}
      <div className="settings-item">
        <div className="settings-label">Enable Dark Mode</div>
        <div className="settings-input">
          <Switch
            aria-label="Enable Dark Mode"
            checked={theme === 'dark'}
            onChange={() => switchTheme(theme === 'dark' ? 'light' : 'dark')}
          />
        </div>
      </div>

      {/* Mining */}
      <div className="settings-item">
        <div className="settings-label">Enable Mining</div>
        <div className="settings-input">
          <Switch
            aria-label="Enable Mining"
            checked={lunaManagedConfig.miningEnabled}
            onChange={(miningEnabled) => {
              if (miningEnabled) {
                setActiveModal('MiningConfig')
              } else {
                updateMiningConfig(null)
              }
            }}
          />
        </div>
      </div>

      {/* Datetime */}
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
      <div className="settings-item">
        <div className="settings-label">Export</div>
        <div className="settings-input">
          <span className="export-private-key" onClick={() => setActiveModal('ExportPrivateKey')}>
            Export Private Key
          </span>
        </div>
      </div>

      {/* Modals */}
      <ExportPrivateKeyModal
        visible={activeModal === 'ExportPrivateKey'}
        getSpendingKey={walletState.getSpendingKey}
        onCancel={() => setActiveModal('none')}
      />
      <MiningConfigModal
        visible={activeModal === 'MiningConfig'}
        onCancel={() => {
          miningConfigChannels.forEach(ipcRemoveAllListeners)
          setActiveModal('none')
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
