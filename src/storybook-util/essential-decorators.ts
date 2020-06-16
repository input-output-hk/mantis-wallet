import {withKnobs} from '@storybook/addon-knobs'
import {withTheme} from './theme-switcher'
import {withBackendState} from './backend-state-decorator'

export const ESSENTIAL_DECORATORS = [withTheme, withBackendState, withKnobs] as const
