import React from 'react'
import {SplashScreen} from './SplashScreen'
import {toFullScreen} from './storybook-util/full-screen-decorator'
import {ESSENTIAL_DECORATORS} from './storybook-util/essential-decorators'

export default {
  title: 'Splash Screen',
  decorators: [...ESSENTIAL_DECORATORS, toFullScreen],
}

export const splashScreen = (): JSX.Element => <SplashScreen />
