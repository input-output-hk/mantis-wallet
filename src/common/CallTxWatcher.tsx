import React, {useEffect} from 'react'
import {EmptyProps} from 'antd/lib/empty'
import {CallTxState} from './call-tx-state'
import {LoadedState} from './wallet-state'
import {withStatusGuard, PropsWithWalletState} from './wallet-status-guard'

const _CallTxWatcher = ({
  walletState,
}: PropsWithWalletState<EmptyProps, LoadedState>): JSX.Element => {
  const {
    syncStatus: {currentBlock},
    getOverviewProps,
  } = walletState

  const {transactions} = getOverviewProps()
  const {updateTxStatuses} = CallTxState.useContainer()

  useEffect(() => {
    updateTxStatuses(transactions)
  }, [currentBlock])

  return <></>
}

export const CallTxWatcher = withStatusGuard(_CallTxWatcher, 'LOADED', () => <></>)
