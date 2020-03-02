import React from 'react'
import {withKnobs} from '@storybook/addon-knobs'
import {withTheme} from './storybook-util/theme-switcher'
import {SplashScreen} from './SplashScreen'

export default {
  title: 'Splash Screen',
  decorators: [withTheme, withKnobs],
}

export const splashScreen = (): JSX.Element => <SplashScreen />
