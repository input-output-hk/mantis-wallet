import React from 'react'
import {BurnCentre} from './BurnCentre'
import {withWalletState} from '../storybook-util/wallet-state-decorator'
import {withPobState} from '../storybook-util/pob-state-decorator'
import {withRouterState} from '../storybook-util/router-state-decorator'
import {withBuildJobState} from '../storybook-util/build-job-state-decorator'
import {ESSENTIAL_DECORATORS} from '../storybook-util/essential-decorators'

export default {
  title: 'Burn Centre',
  decorators: [
    ...ESSENTIAL_DECORATORS,
    withWalletState,
    withPobState,
    withRouterState,
    withBuildJobState,
  ],
}

export const burnCentre = (): JSX.Element => <BurnCentre />
