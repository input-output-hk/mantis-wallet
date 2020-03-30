import React from 'react'
import {withKnobs} from '@storybook/addon-knobs'
import {withTheme} from '../storybook-util/theme-switcher'
import {dust} from '../storybook-util/custom-knobs'
import {ShortNumber} from './ShortNumber'
import {Loading} from './Loading'

export default {
  title: 'Common',
  decorators: [withTheme, withKnobs],
}

export const shortNumber = (): JSX.Element => (
  <ShortNumber big={dust('Number', 123456789)} unit="Dust" />
)

export const loading = (): JSX.Element => (
  <div style={{width: '100vw', height: '100vh'}}>
    <Loading />
  </div>
)
