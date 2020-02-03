import React from 'react'
import {WalletState} from './wallet-state'
import {useInterval} from './hook-utils'
import {SynchronizationStatus} from '../web3'
import './SyncStatus.scss'

interface SyncStatusProps {
  syncStatus: SynchronizationStatus
}

const Message = ({syncStatus}: SyncStatusProps): JSX.Element => {
  if (syncStatus.mode === 'offline') {
    return <>Wallet is offline. Last block: {syncStatus.currentBlock}</>
  } else {
    return (
      <>
        Synchronization progress: {syncStatus.percentage}%, Block: {syncStatus.currentBlock}
      </>
    )
  }
}

export const SyncStatus = (): JSX.Element => {
  const state = WalletState.useContainer()

  useInterval(() => {
    if (state.walletStatus === 'LOADED') state.refreshSyncStatus()
  }, 2000)

  if (state.walletStatus !== 'LOADED') {
    return <></>
  } else {
    return (
      <div className="SyncStatus">
        <Message syncStatus={state.syncStatus} />
      </div>
    )
  }
}
