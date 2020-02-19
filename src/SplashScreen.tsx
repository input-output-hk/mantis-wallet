import React from 'react'
import {Icon} from 'antd'
import {ThemeState} from './theme-state'
import lunaLogoDark from './assets/dark/luna-big.png'
import lunaLogoLight from './assets/light/luna-big.png'
import './SplashScreen.scss'

export const SplashScreen: React.FunctionComponent<{}> = () => {
  const themeState = ThemeState.useContainer()
  const lunaLogo = themeState.theme === 'dark' ? lunaLogoDark : lunaLogoLight

  return (
    <div className="SplashScreen">
      <img className="logo" src={lunaLogo} alt="Luna" />
      <div className="title">Luna</div>
      <div className="spinner">
        <Icon type="loading" style={{fontSize: 24}} spin />
      </div>
      <div className="loading">Loading</div>
    </div>
  )
}
