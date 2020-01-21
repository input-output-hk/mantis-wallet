import React from 'react'
import {Icon} from 'antd'
import lunaLogo from './assets/luna-big.png'
import './SplashScreen.scss'

export const SplashScreen: React.FunctionComponent<{}> = () => (
  <div className="SplashScreen">
    <img className="logo" src={lunaLogo} alt="Luna" />
    <div className="title">Luna</div>
    <div className="spinner">
      <Icon type="loading" style={{fontSize: 24}} spin />
    </div>
    <div className="loading">Loading</div>
  </div>
)
