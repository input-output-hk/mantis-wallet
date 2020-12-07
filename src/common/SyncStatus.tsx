import React from 'react'
import classnames from 'classnames'
import SVG from 'react-inlinesvg'
import {Popover} from 'antd'
import {EmptyProps} from 'antd/lib/empty'
import {LoadedState, SynchronizationStatus} from './wallet-state'
import {BackendState} from './backend-state'
import {SettingsState} from '../settings-state'
import {useRecurringTimeout} from './hook-utils'
import {PropsWithWalletState, withStatusGuard} from './wallet-status-guard'
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

const _SyncStatus = ({walletState}: PropsWithWalletState<EmptyProps, LoadedState>): JSX.Element => {
  useRecurringTimeout(() => walletState.refreshSyncStatus(), 3000)

  return <SyncStatusContent syncStatus={walletState.syncStatus} />
}

export const SyncStatus = withStatusGuard(_SyncStatus, 'LOADED', () => <></>)
