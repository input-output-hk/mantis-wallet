import React, {useState, PropsWithChildren} from 'react'
import {Button, Select, Switch} from 'antd'
import {EmptyProps} from 'antd/lib/empty'
import {SettingsState, TIME_FORMATS, DATE_FORMATS, TimeFormat} from './settings-state'
import {WalletState, canResetWallet} from './common/wallet-state'
import {BackendState} from './common/backend-state'
import {fillActionHandlers} from './common/util'
import {Header} from './common/Header'
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
import './Settings.scss'

const {Option} = Select

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
        <Trans k={['wallet', 'title', 'mySettings']} />
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

  const definedNetworkOptions = DEFINED_NETWORK_NAMES.map((network) => ({
    key: network,
    // FIXME: ETCM-342 remove after upgrading to TS4
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    label: displayNameOfNetwork(network, t),
  }))

  const networkOptions = [
    ...definedNetworkOptions,
    {key: 'custom', label: t(['network', 'names', 'custom'])},
  ]

  return (
    <SettingsWrapper>
      {/* theme */}
      <div className="settings-item">
        <div className="settings-switch-wrapper">
          <div>
            <Trans k={['settings', 'label', 'enableDarkMode']} />
          </div>
          <div>
            <Switch
              aria-label={t(['settings', 'label', 'enableDarkMode'])}
              checked={theme === 'dark'}
              onChange={() => switchTheme(theme === 'dark' ? 'light' : 'dark')}
            />
          </div>
        </div>
      </div>

      {/* language */}
      <div className="settings-item">
        <div className="settings-label">
          <Trans k={['settings', 'label', 'language']} />
        </div>
        <div className="settings-input">
          <Select placeholder="…" value={language} onChange={setLanguage} bordered={false}>
            {LANGUAGES.map((lang) => (
              <Option key={lang} value={lang}>
                {LANGUAGES_DISPLAYED[lang]}
              </Option>
            ))}
          </Select>
        </div>
      </div>
      {/* date format */}
      <div className="settings-item">
        <div className="settings-label">
          <Trans k={['settings', 'label', 'dateFormat']} />
        </div>
        <div className="settings-input">
          <Select placeholder="…" value={dateFormat} onChange={setDateFormat} bordered={false}>
            {DATE_FORMATS.map((v) => (
              <Option key={v} value={v}>
                {v}
              </Option>
            ))}
          </Select>
        </div>
      </div>
      {/* time format */}
      <div className="settings-item">
        <div className="settings-label">
          <Trans k={['settings', 'label', 'timeFormat']} />
        </div>
        <div className="settings-input">
          <Select placeholder="…" value={timeFormat} onChange={setTimeFormat} bordered={false}>
            {TIME_FORMATS.map((v) => (
              <Option key={v} value={v}>
                <Trans k={TIME_FORMAT_LABELS[v]} />
              </Option>
            ))}
          </Select>
        </div>
      </div>
      {/* network switcher */}
      {canResetWallet(walletState) && (
        <>
          <div className="settings-item">
            <div className="settings-label">
              <Trans k={['settings', 'label', 'network']} />
            </div>
            <div className="settings-input">
              <Select
                placeholder="…"
                value={isDefinedNetworkName(networkName) ? networkName : 'custom'}
                onChange={changeNetwork}
                bordered={false}
              >
                {networkOptions.map(({key, label}) => (
                  <Option key={key} value={key}>
                    {label}
                  </Option>
                ))}
              </Select>
            </div>
          </div>
          <ChangeNetworkModal
            visible={activeModal === 'ChangeNetwork'}
            onCancel={() => {
              setActiveModal('none')
              setSelectedNetwork(networkName)
            }}
            newNetwork={selectedNetwork}
            walletState={walletState}
          />
        </>
      )}
      {/* export private key */}
      {walletState.walletStatus === 'LOADED' && (
        <>
          <div className="settings-item">
            <div className="main-buttons">
              <Button
                className="export-private-key action right-diagonal"
                type="primary"
                size="large"
                {...fillActionHandlers(() => setActiveModal('ExportPrivateKey'))}
              >
                <Trans k={['settings', 'button', 'exportPrivateKey']} />
              </Button>
            </div>
          </div>
          <ExportPrivateKeyModal
            visible={activeModal === 'ExportPrivateKey'}
            getPrivateKey={walletState.getPrivateKey}
            onCancel={() => setActiveModal('none')}
          />
        </>
      )}
    </SettingsWrapper>
  )
}
