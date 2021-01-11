import React from 'react'
import classnames from 'classnames'
import SVG from 'react-inlinesvg'
import {Popover} from 'antd'
import {SynchronizationStatus, WalletState, SynchronizationStatusOnline} from './wallet-state'
import {BackendState} from './backend-state'
import {SettingsState} from '../settings-state'
import {Trans} from './Trans'
import {displayNameOfNetwork} from '../config/type'
import refreshIcon from '../assets/icons/refresh.svg'
import './SyncStatus.scss'

interface SyncStatusProps {
  syncStatus: SynchronizationStatus
}

const getSyncBlocksProgress = (syncStatus: SynchronizationStatusOnline): number => {
  if (syncStatus.highestKnownBlock === 0) return 0
  return (syncStatus.currentBlock / syncStatus.highestKnownBlock) * 100
}

export const SyncMessage = ({syncStatus}: SyncStatusProps): JSX.Element => {
  switch (syncStatus.mode) {
    case 'offline':
      return <Trans k={['wallet', 'syncStatus', 'syncConnecting']} />
    case 'synced':
      return <Trans k={['wallet', 'syncStatus', 'fullySynced']} />
    case 'online':
      return syncStatus.type === 'blocks' ? (
        <Trans
          k={['wallet', 'syncStatus', 'syncingBlocks']}
          values={{percentage: getSyncBlocksProgress(syncStatus)}}
        />
      ) : (
        <Trans
          k={['wallet', 'syncStatus', 'syncingState']}
          values={{processed: syncStatus.pulledStates, total: syncStatus.knownStates}}
        />
      )
  }
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
      {syncStatus.mode === 'online' && syncStatus.type === 'blocks' && (
        <div className="syncStatusLine">
          <Trans
            k={['wallet', 'syncStatus', 'highestBlock']}
            values={{blockNumber: syncStatus.highestKnownBlock}}
          />
        </div>
      )}
      {syncStatus.mode === 'online' && syncStatus.type === 'state' && (
        <div className="syncStatusLine">
          <Trans k={['wallet', 'syncStatus', 'syncingStateDescription']} />
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
