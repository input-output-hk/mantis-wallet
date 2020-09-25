import React, {useState, PropsWithChildren} from 'react'
import _ from 'lodash/fp'
import {Switch} from 'antd'
import {EmptyProps} from 'antd/lib/empty'
import {SettingsState, TIME_FORMATS, DATE_FORMATS, TimeFormat} from './settings-state'
import {LoadedState} from './common/wallet-state'
import {withStatusGuard, PropsWithWalletState} from './common/wallet-status-guard'
import {fillActionHandlers} from './common/util'
import {HeaderWithSyncStatus} from './common/HeaderWithSyncStatus'
import {DialogDropdown} from './common/dialog/DialogDropdown'
import {NoWallet} from './wallets/NoWallet'
import {ExportPrivateKeyModal} from './wallets/modals/ExportPrivateKey'
import {Trans} from './common/Trans'
import {TKeyRenderer} from './common/i18n'
import {LANGUAGES, Language} from './shared/i18n'
import './Settings.scss'

type ModalId = 'none' | 'ExportPrivateKey'

const TIME_FORMAT_LABELS: Record<TimeFormat, TKeyRenderer> = {
  '12-hour': ['settings', 'timeFormat', '12hour'],
  '24-hour': ['settings', 'timeFormat', '24hour'],
}

const LANGUAGES_DISPLAYED: Record<Language, string> = {
  en: 'English',
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
    language,
    setLanguage,
    translation: {t},
  } = SettingsState.useContainer()

  const [activeModal, setActiveModal] = useState<ModalId>('none')

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

      {/* l10n */}
      <div className="settings-item">
        <DialogDropdown
          label={t(['settings', 'label', 'language'])}
          options={LANGUAGES.map((l) => ({key: l, label: LANGUAGES_DISPLAYED[l]}))}
          defaultOptionIndex={_.indexOf(language)(LANGUAGES)}
          onChange={setLanguage}
        />
      </div>
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
        getPrivateKey={walletState.getPrivateKey}
        onCancel={() => setActiveModal('none')}
      />
    </SettingsWrapper>
  )
}

export const Settings = withStatusGuard(_Settings, 'LOADED', () => (
  <SettingsWrapper>
    <NoWallet />
  </SettingsWrapper>
))
