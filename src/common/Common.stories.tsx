import React from 'react'
import {withKnobs, text} from '@storybook/addon-knobs'
import {withTheme} from '../storybook-util/theme-switcher'
import {dust} from '../storybook-util/custom-knobs'
import {ShortNumber} from './ShortNumber'
import {Loading} from './Loading'
import {CopyableLongText} from './CopyableLongText'

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

export const copyableLongText = (): JSX.Element => (
  <CopyableLongText
    content={text('Copyable long text', 'This text can be copied by clicking the icon.')}
  />
)
