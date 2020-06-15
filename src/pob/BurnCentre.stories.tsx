import React from 'react'
import {withKnobs} from '@storybook/addon-knobs'
import {withTheme} from '../storybook-util/theme-switcher'
import {BurnCentre} from './BurnCentre'
import {withWalletState} from '../storybook-util/wallet-state-decorator'
import {withBackendState} from '../storybook-util/backend-state-decorator'
import {withPobState} from '../storybook-util/pob-state-decorator'
import {withRouterState} from '../storybook-util/router-state-decorator'
import {withBuildJobState} from '../storybook-util/build-job-state-decorator'

export default {
  title: 'Burn Centre',
  decorators: [
    withTheme,
    withKnobs,
    withWalletState,
    withBackendState,
    withPobState,
    withRouterState,
    withBuildJobState,
  ],
}

export const burnCentre = (): JSX.Element => <BurnCentre />
