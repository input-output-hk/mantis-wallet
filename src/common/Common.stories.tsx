import React from 'react'
import {withKnobs, number} from '@storybook/addon-knobs'
import {withTheme} from '../storybook-util/theme-switcher'
import BigNumber from 'bignumber.js'
import {ShortNumber} from './ShortNumber'
import {Loading} from './Loading'
import './Loading.scss'

export default {
  title: 'Common',
  decorators: [withTheme, withKnobs],
}

export const shortNumber = (): JSX.Element => (
  <ShortNumber big={new BigNumber(number('Number', 123456789))} unit="exact" />
)

export const loading = (): JSX.Element => (
  <div style={{width: '100vw', height: '100vh'}}>
    <Loading />
  </div>
)
