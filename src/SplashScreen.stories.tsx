import React from 'react'
import {withKnobs} from '@storybook/addon-knobs'
import {withTheme} from './storybook-util/theme-switcher'
import {SplashScreen} from './SplashScreen'
import {toFullScreen} from './storybook-util/full-screen-decorator'

export default {
  title: 'Splash Screen',
  decorators: [withTheme, withKnobs, toFullScreen],
}

export const splashScreen = (): JSX.Element => <SplashScreen />
