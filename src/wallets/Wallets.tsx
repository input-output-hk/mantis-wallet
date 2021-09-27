import React, {useEffect} from 'react'
import {pipe} from 'fp-ts/lib/function'
import {option} from 'fp-ts'
import {message} from 'antd'
import {WalletState} from '../common/wallet-state'
import {Navigate} from '../layout/Router'
import {Loading} from '../common/Loading'
import {Wallet} from './Wallet'
import {useTranslation} from '../settings-state'

export const Wallets = (): JSX.Element => {
  const walletState = WalletState.useContainer()

  const {translateError} = useTranslation()
  useEffect(() => {
    pipe(
      walletState.error,
      option.map(translateError),
      option.fold(
        () => void 0,
        (error) => {
          message.error({content: error, duration: 5, key: 'walletError'})
        },
      ),
    )
  }, [walletState.error])

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
