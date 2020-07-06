import React, {useState, useEffect} from 'react'
import {EmptyProps} from 'antd/lib/empty'
import {Button} from 'antd'
import {ErrorState} from '../common/wallet-state'
import {withStatusGuard, PropsWithWalletState} from '../common/wallet-status-guard'
import {HeaderWithSyncStatus} from '../common/HeaderWithSyncStatus'
import {useInterval} from '../common/hook-utils'
import './WalletErrorScreen.scss'

const _WalletError = ({walletState}: PropsWithWalletState<EmptyProps, ErrorState>): JSX.Element => {
  const {error, reset} = walletState
  const [countdown, setCountdown] = useState(60)
  const [isTraceShown, showTrace] = useState(false)

  useInterval(() => {
    setCountdown((countdown) => countdown - 1)
  }, 1000)

  useEffect(() => {
    if (countdown <= 0) reset()
  }, [countdown])

  return (
    <div className="WalletError">
      <div className="header">
        <HeaderWithSyncStatus>An error occurred while loading the wallet</HeaderWithSyncStatus>
      </div>

      <div className="error-msg">{error.message}</div>

      <div>
        {error.stack && isTraceShown ? (
          <div className="stacktrace">{error.stack}</div>
        ) : (
          <div className="show-stacktrace" onClick={() => showTrace(true)}>
            Show stacktrace
          </div>
        )}
      </div>

      <div>
        <div className="retry-countdown">
          Reloading wallet in <b>{countdown}</b>...
        </div>
        <div className="retry-manual">
          <Button type="primary" onClick={reset}>
            Reload Now
          </Button>
        </div>
      </div>
    </div>
  )
}

export const WalletError = withStatusGuard(_WalletError, 'ERROR')
