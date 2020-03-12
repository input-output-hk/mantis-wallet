import React from 'react'
import classnames from 'classnames'
import SVG from 'react-inlinesvg'
import {Popover} from 'antd'
import {WalletState} from './wallet-state'
import {RouterState} from '../router-state'
import {useInterval} from './hook-utils'
import {SynchronizationStatus} from '../web3'
import refreshIcon from '../assets/icons/refresh.svg'
import './SyncStatus.scss'

interface SyncStatusProps {
  syncStatus: SynchronizationStatus
  onClick?: () => void
}

type SyncStatus = 'offline' | 'synced' | 'syncing'

const getSyncStatus = (syncStatus: SynchronizationStatus): SyncStatus => {
  if (syncStatus.mode === 'offline') return 'offline'
  if (syncStatus.percentage === 100) return 'synced'
  return 'syncing'
}

const Message = ({syncStatus}: SyncStatusProps): JSX.Element => {
  if (syncStatus.mode === 'offline') return <>Error Syncing</>
  if (syncStatus.percentage === 100) return <>Fully Synced</>
  return <>Syncing Blocks {syncStatus.percentage}%</>
}

export const SyncStatusContent = ({syncStatus, onClick}: SyncStatusProps): JSX.Element => {
  const classes = classnames('SyncStatus', getSyncStatus(syncStatus))
  return (
    <span className={classes} onClick={onClick}>
      <Popover content={`Current block: ${syncStatus.currentBlock}`} placement="left">
        <Message syncStatus={syncStatus} />
        <SVG src={refreshIcon} className="svg" />
      </Popover>
    </span>
  )
}

export const FloatingSyncStatus = (): JSX.Element => {
  const walletState = WalletState.useContainer()
  const routerState = RouterState.useContainer()

  useInterval(() => {
    if (walletState.walletStatus === 'LOADED') walletState.refreshSyncStatus()
  }, 3000)

  if (walletState.walletStatus !== 'LOADED' || routerState.currentRouteId === 'WALLETS') {
    return <></>
  }

  return (
    <div className="FloatingSyncStatus">
      <SyncStatusContent syncStatus={walletState.syncStatus} />
    </div>
  )
}
