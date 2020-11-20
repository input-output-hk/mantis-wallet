import React, {useState, PropsWithChildren} from 'react'
import _ from 'lodash/fp'
import {Switch} from 'antd'
import {EmptyProps} from 'antd/lib/empty'
import {SettingsState, TIME_FORMATS, DATE_FORMATS, TimeFormat} from './settings-state'
import {WalletState, canResetWallet} from './common/wallet-state'
import {fillActionHandlers} from './common/util'
import {Header} from './common/Header'
import {DialogDropdown} from './common/dialog/DialogDropdown'
import {ExportPrivateKeyModal} from './wallets/modals/ExportPrivateKey'
import {Trans} from './common/Trans'
import {TKeyRenderer} from './common/i18n'
import {LANGUAGES, Language} from './shared/i18n'
import {ChangeNetworkModal} from './wallets/modals/ChangeNetwork'
import {
  NetworkName,
  DEFINED_NETWORK_NAMES,
  isDefinedNetworkName,
  displayNameOfNetwork,
} from './config/type'
import {BackendState} from './common/backend-state'

import './Settings.scss'

type ModalId = 'none' | 'ExportPrivateKey' | 'ChangeNetwork'

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
      <Header>
        <Trans k={['title', 'settings']} />
      </Header>
      <div className="content">{children}</div>
    </div>
  )
}

export const Settings = (): JSX.Element => {
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

  const {networkName} = BackendState.useContainer()

  const walletState = WalletState.useContainer()

  const [activeModal, setActiveModal] = useState<ModalId>('none')

  const [selectedNetwork, setSelectedNetwork] = useState<NetworkName>(networkName)

  const changeNetwork = (newNetwork: NetworkName): void => {
    setSelectedNetwork(newNetwork)
    setActiveModal('ChangeNetwork')
  }

  const networkOptions = [...DEFINED_NETWORK_NAMES, 'custom'].map((network) => ({
    key: network,
    // FIXME: ETCM-342 remove after upgrading to TS4
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    label: t(['network', 'names', displayNameOfNetwork(network)]),
  }))

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
      {walletState.walletStatus === 'LOADED' && (
        <>
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
          <ExportPrivateKeyModal
            visible={activeModal === 'ExportPrivateKey'}
            getPrivateKey={walletState.getPrivateKey}
            onCancel={() => setActiveModal('none')}
          />
        </>
      )}
      {canResetWallet(walletState) && (
        <>
          <div className="settings-item">
            <DialogDropdown
              label="Network"
              options={networkOptions}
              //FIXME add ability to control selected option index from outside
              selectedKey={isDefinedNetworkName(networkName) ? networkName : 'custom'}
              onChange={changeNetwork}
            />
          </div>
          <ChangeNetworkModal
            visible={activeModal === 'ChangeNetwork'}
            onCancel={() => {
              setActiveModal('none')
              setSelectedNetwork(networkName)
            }}
            newNetwork={selectedNetwork}
          />
        </>
      )}
    </SettingsWrapper>
  )
}
