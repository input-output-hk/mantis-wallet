import React, {useState, useEffect} from 'react'
import {Button} from 'antd'
import {ErrorState} from '../common/wallet-state'
import {withStatusGuard, PropsWithWalletState} from '../common/wallet-status-guard'
import {Header} from '../common/Header'
import {fillActionHandlers} from '../common/util'
import {useInterval} from '../common/hook-utils'
import {Trans} from '../common/Trans'
import {useTranslation} from '../settings-state'
import './WalletErrorScreen.scss'

interface WalletErrorProps {
  countdownStart?: number
}

const _WalletError = ({
  countdownStart = 20,
  walletState,
}: PropsWithWalletState<WalletErrorProps, ErrorState>): JSX.Element => {
  const {translateError} = useTranslation()
  const {error, reset} = walletState
  const [countdown, setCountdown] = useState(countdownStart)
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
        <Header>
          <Trans k={['wallet', 'error', 'errorWhileLoadingTheWallet']} />
        </Header>
      </div>

      <div className="error-msg">{translateError(error)}</div>

      <div>
        {error.stack && isTraceShown ? (
          <div className="stacktrace">{error.stack}</div>
        ) : (
          <div className="show-stacktrace" {...fillActionHandlers(() => showTrace(true))}>
            <Trans k={['wallet', 'button', 'showErrorStacktrace']} />
          </div>
        )}
      </div>

      <div>
        <div className="retry-countdown">
          <Trans k={['wallet', 'message', 'reloadingWalletInCount']} values={{countdown}} />
        </div>
        <div className="retry-manual">
          <Button type="primary" onClick={() => reset()}>
            <Trans k={['wallet', 'button', 'reloadWalletNow']} />
          </Button>
        </div>
      </div>
    </div>
  )
}

export const WalletError = withStatusGuard(_WalletError, 'ERROR')
