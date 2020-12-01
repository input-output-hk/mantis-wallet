import React from 'react'
import classnames from 'classnames'
import SVG from 'react-inlinesvg'
import {Popover} from 'antd'
import {EmptyProps} from 'antd/lib/empty'
import {SynchronizationStatus, LoadedState} from './wallet-state'
import {useInterval} from './hook-utils'
import {withStatusGuard, PropsWithWalletState} from './wallet-status-guard'
import {Trans} from './Trans'
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
  const classes = classnames('SyncStatus', syncStatus.mode)
  const popoverContent = (
    <span>
      <div>
        <Trans
          k={['wallet', 'syncStatus', 'currentBlock']}
          values={{blockNumber: syncStatus.currentBlock}}
        />
      </div>
      {syncStatus.mode === 'online' && (
        <div>
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
    </span>
  )
}

const _SyncStatus = ({walletState}: PropsWithWalletState<EmptyProps, LoadedState>): JSX.Element => {
  useInterval(() => {
    walletState.refreshSyncStatus()
  }, 3000)

  return <SyncStatusContent syncStatus={walletState.syncStatus} />
}

export const SyncStatus = withStatusGuard(_SyncStatus, 'LOADED', () => <></>)
