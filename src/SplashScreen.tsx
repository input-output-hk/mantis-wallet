import React from 'react'
import {Icon} from 'antd'
import {LunaWalletLoader} from 'luna-wallet-loader'
import {ThemeState} from './theme-state'
import './SplashScreen.scss'

export const SplashScreen: React.FunctionComponent<{}> = () => {
  const {theme} = ThemeState.useContainer()

  return (
    <div className="SplashScreen">
      <LunaWalletLoader className="logo" mode={theme} />
      <div className="title">Luna</div>
      <div className="spinner">
        <Icon type="loading" spin />
      </div>
      <div className="loading">Loading</div>
    </div>
  )
}
