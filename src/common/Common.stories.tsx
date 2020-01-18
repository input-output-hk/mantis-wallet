import React from 'react'
import {withKnobs, number} from '@storybook/addon-knobs'
import Big from 'big.js'
import {ShortNumber} from './ShortNumber'
import {Loading} from './Loading'
import './Loading.scss'

export default {
  title: 'Common',
  decorators: [withKnobs],
}

export const shortNumber = (): JSX.Element => <ShortNumber big={Big(number('Number', 123456789))} />

export const loading = (): JSX.Element => (
  <div style={{width: '100vw', height: '100vh'}}>
    <Loading />
  </div>
)
