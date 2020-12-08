import React, {useEffect, useState} from 'react'
import {pipe} from 'fp-ts/lib/function'
import {option} from 'fp-ts'
import {message} from 'antd'
import {WalletState} from '../common/wallet-state'
import {Navigate} from '../layout/Router'
import {Loading} from '../common/Loading'
import {Wallet} from './Wallet'
import {rendererLog} from '../common/logger'
import {useTranslation} from '../settings-state'
import {useRecurringTimeout} from '../common/hook-utils'

export const Wallets = (): JSX.Element => {
  const walletState = WalletState.useContainer()

  useEffect(() => {
    if (walletState.walletStatus === 'INITIAL') {
      walletState.refreshSyncStatus()
    }

    rendererLog.debug(`walletStatus: ${walletState.walletStatus}`)
  }, [walletState.walletStatus])

  const {translateError} = useTranslation()
  const [allowUpdates, setUpdatesAllowance] = useState(false)
  useEffect(() => {
    pipe(
      walletState.error,
      option.map((error) => translateError(error)),
      option.fold(
        () => void 0,
        (error) => {
          message.error(error, 5, () => {
            setUpdatesAllowance(true)
          })
        },
      ),
    )
  }, [walletState.error])

  useRecurringTimeout(async () => {
    if (allowUpdates) {
      setUpdatesAllowance(false)
      switch (walletState.walletStatus) {
        case 'INITIAL':
        case 'LOADED':
        case 'LOADING':
          return walletState.refreshSyncStatus()
      }
    }
  }, 20000)

  switch (walletState.walletStatus) {
    case 'INITIAL': {
      return <Loading />
    }
    case 'LOADING': {
      return <Loading />
    }
    case 'LOADED': {
      return <Wallet />
    }
    case 'NO_WALLET': {
      return <Navigate to="WALLET_SETUP" />
    }
  }
}
