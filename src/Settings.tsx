import React, {useState, useEffect, PropsWithChildren} from 'react'
import _ from 'lodash/fp'
import {Switch} from 'antd'
import {EmptyProps} from 'antd/lib/empty'
import {SettingsState, TIME_FORMATS, DATE_FORMATS, TimeFormat} from './settings-state'
import {IPCToRendererChannelName} from './shared/ipc-types'
import {LoadedState} from './common/wallet-state'
import {withStatusGuard, PropsWithWalletState} from './common/wallet-status-guard'
import {updateMiningConfig, ipcRemoveAllListeners, ipcListenToMain} from './common/ipc-util'
import {fillActionHandlers} from './common/util'
import {HeaderWithSyncStatus} from './common/HeaderWithSyncStatus'
import {DialogDropdown} from './common/dialog/DialogDropdown'
import {NoWallet} from './wallets/NoWallet'
import {ExportPrivateKeyModal} from './wallets/modals/ExportPrivateKey'
import {MiningConfigModal, miningConfigChannels} from './RemoteSettingsManager'
import {loadLunaManagedConfig} from './config/renderer'
import {LunaManagedConfig} from './config/type'
import {Trans} from './common/Trans'
import {TKeyRenderer} from './common/i18n'
import './Settings.scss'

type ModalId = 'none' | 'MiningConfig' | 'ExportPrivateKey'

const TIME_FORMAT_LABELS: Record<TimeFormat, TKeyRenderer> = {
  '12-hour': ['settings', 'timeFormat', '12hour'],
  '24-hour': ['settings', 'timeFormat', '24hour'],
}

const SettingsWrapper = ({children}: PropsWithChildren<EmptyProps>): JSX.Element => {
  return (
    <div className="Settings">
      <HeaderWithSyncStatus>
        <Trans k={['title', 'settings']} />
      </HeaderWithSyncStatus>
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
    translation: {t},
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
        <div className="settings-label">
          <Trans k={['settings', 'label', 'enableDarkMode']} />
        </div>
        <div className="settings-input">
          <Switch
            aria-label={t(['settings', 'label', 'enableDarkMode'])}
            checked={theme === 'dark'}
            onChange={() => switchTheme(theme === 'dark' ? 'light' : 'dark')}
          />
        </div>
      </div>

      {/* Mining */}
      <div className="settings-item">
        <div className="settings-label">
          <Trans k={['settings', 'label', 'enableMining']} />
        </div>
        <div className="settings-input">
          <Switch
            aria-label={t(['settings', 'label', 'enableMining'])}
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
          label={t(['settings', 'label', 'dateFormat'])}
          options={DATE_FORMATS}
          defaultOptionIndex={_.indexOf(dateFormat)(DATE_FORMATS)}
          onChange={setDateFormat}
        />
      </div>
      <div className="settings-item">
        <DialogDropdown
          label={t(['settings', 'label', 'timeFormat'])}
          options={TIME_FORMATS.map((key) => ({key, label: t(TIME_FORMAT_LABELS[key])}))}
          defaultOptionIndex={_.indexOf(timeFormat)(TIME_FORMATS)}
          onChange={setTimeFormat}
        />
      </div>
      <div className="settings-item">
        <div className="settings-label">
          <Trans k={['settings', 'label', 'exportPrivateKey']} />
        </div>
        <div className="settings-input">
          <span
            className="export-private-key"
            {...fillActionHandlers(() => setActiveModal('ExportPrivateKey'))}
          >
            <Trans k={['settings', 'button', 'exportPrivateKey']} />
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
