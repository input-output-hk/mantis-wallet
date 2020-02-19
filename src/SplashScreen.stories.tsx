import React from 'react'
import {SplashScreen} from './SplashScreen'
import {ThemeState} from './theme-state'

export default {
  title: 'Splash Screen',
}

export const dark = (): JSX.Element => (
  <ThemeState.Provider initialState="dark">
    <SplashScreen />
  </ThemeState.Provider>
)

export const light = (): JSX.Element => (
  <ThemeState.Provider initialState="light">
    <SplashScreen />
  </ThemeState.Provider>
)
