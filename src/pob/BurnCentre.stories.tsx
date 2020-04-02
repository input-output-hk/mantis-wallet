import React from 'react'
import {withKnobs} from '@storybook/addon-knobs'
import {withTheme} from '../storybook-util/theme-switcher'
import {BurnCentre} from './BurnCentre'
import {withWalletState} from '../storybook-util/wallet-state-decorator'
import {withPobState} from '../storybook-util/pob-state-decorator'
import {withRouterState} from '../storybook-util/router-state-decorator'

export default {
  title: 'Burn Centre',
  decorators: [withTheme, withKnobs, withWalletState, withPobState, withRouterState],
}

export const burnCentre = (): JSX.Element => <BurnCentre />
