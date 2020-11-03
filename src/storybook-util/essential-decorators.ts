import {withKnobs} from '@storybook/addon-knobs'
import {withSettings} from './settings-state-decorator'
import {withBackendState} from './backend-state-decorator'
import {withWalletState} from './wallet-state-decorator'
import {withRouterState} from './router-state-decorator'

export const ESSENTIAL_DECORATORS = [
  withSettings,
  withBackendState,
  withWalletState,
  withRouterState,
  withKnobs,
] as const
