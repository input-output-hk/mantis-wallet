import React from 'react'
import classnames from 'classnames'
import SVG from 'react-inlinesvg'
import {Popover} from 'antd'
import {SynchronizationStatus, WalletState} from './wallet-state'
import {BackendState} from './backend-state'
import {SettingsState} from '../settings-state'
import {Trans} from './Trans'
import {displayNameOfNetwork} from '../config/type'
import refreshIcon from '../assets/icons/refresh.svg'
import './SyncStatus.scss'

interface SyncStatusProps {
  syncStatus: SynchronizationStatus
}

export const SyncMessage = ({syncStatus}: SyncStatusProps): JSX.Element => {
  if (syncStatus.mode === 'offline') return <Trans k={['wallet', 'syncStatus', 'syncConnecting']} />
  if (syncStatus.mode === 'synced') return <Trans k={['wallet', 'syncStatus', 'fullySynced']} />
  return (
    <Trans
      k={
        syncStatus.currentBlock === syncStatus.highestKnownBlock
          ? ['wallet', 'syncStatus', 'syncingState']
          : ['wallet', 'syncStatus', 'syncingBlocks']
      }
      values={{percentage: syncStatus.percentage.toFixed(2)}}
    />
  )
}

export const SyncStatusContent = ({syncStatus}: SyncStatusProps): JSX.Element => {
  const {
    translation: {t},
  } = SettingsState.useContainer()
  const {networkName} = BackendState.useContainer()
  const classes = classnames('SyncStatus', syncStatus.mode)
  const popoverContent = (
    <span>
      <div className="syncStatusLine">
        <Trans
          k={['wallet', 'syncStatus', 'currentBlock']}
          values={{blockNumber: syncStatus.currentBlock}}
        />
      </div>
      {syncStatus.mode === 'online' && (
        <div className="syncStatusLine">
          <Trans
            k={['wallet', 'syncStatus', 'highestBlock']}
            values={{blockNumber: syncStatus.highestKnownBlock}}
          />
        </div>
      )}
    </span>
  )
  return (
    <span className={classes}>
      <Popover content={popoverContent} placement="bottom">
        <span>
          <SyncMessage syncStatus={syncStatus} />
          <SVG src={refreshIcon} className="svg" />
        </span>
      </Popover>
      <div className="network">{displayNameOfNetwork(networkName, t)}</div>
    </span>
  )
}

export const SyncStatus = (): JSX.Element => {
  const walletState = WalletState.useContainer()

  return <SyncStatusContent syncStatus={walletState.syncStatus} />
}
