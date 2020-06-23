import {withKnobs} from '@storybook/addon-knobs'
import {withSettings} from './settings-state-decorator'
import {withBackendState} from './backend-state-decorator'

export const ESSENTIAL_DECORATORS = [withSettings, withBackendState, withKnobs] as const
